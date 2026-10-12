#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod library;
mod platform;
use std::{
    collections::BTreeSet,
    sync::{atomic::AtomicBool, Mutex},
};
use tauri::{Emitter, Manager};
use tauri_plugin_opener::OpenerExt;
use tauri_plugin_updater::UpdaterExt;

const UPDATE_URL: &str =
    "https://github.com/jinyoshida01/open-shelf/releases/latest/download/latest.json";
#[tauri::command]
async fn check_update(
    app: tauri::AppHandle,
    state: tauri::State<'_, library::ManagerState>,
) -> Result<serde_json::Value, String> {
    if state.data.lock().await.offline {
        return Err("Turn off offline mode to check for updates".into());
    }
    let key = option_env!("OPEN_SHELF_UPDATER_PUBLIC_KEY").ok_or(
        "Updates will be available with the first signed release. This is a local preview build.",
    )?;
    let updater = app
        .updater_builder()
        .pubkey(key)
        .endpoints(vec![UPDATE_URL.parse().unwrap()])
        .map_err(|e| e.to_string())?
        .build()
        .map_err(|e| e.to_string())?;
    let update = updater
        .check()
        .await
        .map_err(|e| format!("Could not check for updates: {e}"))?;
    Ok(match update {
        Some(u) => serde_json::json!({"version":u.version,"notes":u.body}),
        None => serde_json::Value::Null,
    })
}
#[tauri::command]
async fn install_update(
    app: tauri::AppHandle,
    state: tauri::State<'_, library::ManagerState>,
    version: String,
) -> Result<(), String> {
    if state.data.lock().await.offline {
        return Err("Turn off offline mode to install an update".into());
    }
    let key = option_env!("OPEN_SHELF_UPDATER_PUBLIC_KEY")
        .ok_or("This preview is not connected to signed releases")?;
    let updater = app
        .updater_builder()
        .pubkey(key)
        .endpoints(vec![UPDATE_URL.parse().unwrap()])
        .map_err(|e| e.to_string())?
        .build()
        .map_err(|e| e.to_string())?;
    let update = updater
        .check()
        .await
        .map_err(|e| e.to_string())?
        .ok_or("No update available")?;
    if update.version != version {
        return Err("The available update has changed. Check for updates again.".into());
    }
    let mut received = 0;
    update
        .download_and_install(
            |chunk, total| {
                received += chunk;
                let _ = app.emit(
                    "app-update",
                    serde_json::json!({"received":received,"total":total}),
                );
            },
            || {},
        )
        .await
        .map_err(|e| e.to_string())?;
    app.restart()
}
#[tauri::command]
fn open_external(app: tauri::AppHandle, url: String) -> Result<(), String> {
    let parsed = reqwest::Url::parse(&url).map_err(|_| "Invalid link")?;
    if parsed.scheme() != "https" {
        return Err("Only secure web links can open outside the app".into());
    }
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|e| e.to_string())
}
fn main() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.show();
                let _ = w.set_focus();
            }
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let data = library::read(app.handle())?;
            // Recover our own session registrations after an interrupted exit.
            // Never touch fonts from outside this app's saved library.
            for record in data.fonts.values() {
                for file in &record.files {
                    let _ = platform::activate(std::path::Path::new(&file.path), false);
                }
            }
            let mut system = font_kit::source::SystemSource::new()
                .all_families()
                .unwrap_or_default();
            system.sort();
            system.dedup();
            let state = library::ManagerState {
                data: tokio::sync::Mutex::new(data.clone()),
                active: Mutex::new(BTreeSet::new()),
                cancel: AtomicBool::new(false),
                download_lock: tokio::sync::Mutex::new(()),
                index: serde_json::from_str(include_str!("../../data/desktop-fonts.json"))?,
                system,
            };
            // Restore each saved activation independently; one missing file must not prevent launch.
            for (id, r) in &data.fonts {
                if library::wanted(&data, id) && library::set_record(r, true).is_ok() {
                    state.active.lock().unwrap().insert(id.clone());
                }
            }
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            library::device_state,
            library::set_offline,
            library::download_family,
            library::cancel_download,
            library::set_activation,
            library::edit_font,
            library::import_fonts,
            library::export_fonts,
            check_update,
            install_update,
            open_external
        ])
        .build(tauri::generate_context!())
        .expect("Could not launch Open Shelf");
    app.run(|app, event| {
        if matches!(event, tauri::RunEvent::Exit) {
            let state = app.state::<library::ManagerState>();
            let data = state.data.blocking_lock();
            let active = state.active.lock().unwrap();
            for id in active.iter() {
                if let Some(r) = data.fonts.get(id) {
                    let _ = library::set_record(r, false);
                }
            }
        }
    });
}

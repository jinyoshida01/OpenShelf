use crate::platform;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, BTreeSet},
    fs,
    path::{Path, PathBuf},
    sync::atomic::{AtomicBool, Ordering},
};
use tauri::{AppHandle, Emitter, Manager};

#[derive(Clone, Serialize, Deserialize)]
pub struct Asset {
    pub name: String,
    pub url: String,
    pub hash: String,
}
#[derive(Clone, Serialize, Deserialize)]
pub struct Family {
    pub family: String,
    pub source: String,
    pub coverage: String,
    pub files: Vec<Asset>,
    pub licences: Vec<Asset>,
}
#[derive(Clone, Serialize, Deserialize)]
pub struct FontFile {
    pub path: String,
    pub weight: String,
    pub style: String,
}
#[derive(Clone, Serialize, Deserialize)]
pub struct Record {
    pub id: String,
    pub family: String,
    pub source: String,
    pub coverage: String,
    pub files: Vec<FontFile>,
    pub bytes: u64,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub category: String,
    #[serde(default)]
    pub designer: String,
    #[serde(default)]
    pub tags: String,
    #[serde(default)]
    pub manual: bool,
}
#[derive(Clone, Default, Serialize, Deserialize)]
pub struct Library {
    #[serde(default)]
    pub fonts: BTreeMap<String, Record>,
    #[serde(default)]
    pub groups: BTreeMap<String, BTreeSet<String>>,
    #[serde(default)]
    pub offline: bool,
}
pub struct ManagerState {
    pub data: tokio::sync::Mutex<Library>,
    pub active: std::sync::Mutex<BTreeSet<String>>,
    pub cancel: AtomicBool,
    pub download_lock: tokio::sync::Mutex<()>,
    pub index: BTreeMap<String, Family>,
    pub system: Vec<String>,
}
#[derive(Serialize)]
pub struct Snapshot {
    pub fonts: Vec<Record>,
    pub active: Vec<String>,
    pub groups: BTreeMap<String, BTreeSet<String>>,
    pub offline: bool,
    pub system: Vec<String>,
    pub downloadable: Vec<String>,
    pub version: String,
    pub updates_configured: bool,
}
pub fn root(app: &AppHandle) -> Result<PathBuf, String> {
    app.path().app_local_data_dir().map_err(|e| e.to_string())
}
pub fn read(app: &AppHandle) -> Result<Library, String> {
    let p = root(app)?.join("library.json");
    if !p.exists() {
        return Ok(Library::default());
    }
    serde_json::from_slice(&fs::read(p).map_err(|e| e.to_string())?)
        .map_err(|e| format!("Cannot read saved library: {e}"))
}
pub fn save(app: &AppHandle, data: &Library) -> Result<(), String> {
    let r = root(app)?;
    fs::create_dir_all(&r).map_err(|e| e.to_string())?;
    let mut temp = tempfile::NamedTempFile::new_in(&r).map_err(|e| e.to_string())?;
    serde_json::to_writer(&mut temp, data).map_err(|e| e.to_string())?;
    temp.as_file().sync_all().map_err(|e| e.to_string())?;
    temp.persist(r.join("library.json"))
        .map_err(|e| e.to_string())?;
    Ok(())
}
pub fn wanted(data: &Library, id: &str) -> bool {
    data.fonts.get(id).is_some_and(|r| r.manual) || data.groups.values().any(|g| g.contains(id))
}
pub fn set_record(record: &Record, on: bool) -> Result<(), String> {
    let mut done = vec![];
    for file in &record.files {
        if let Err(e) = platform::activate(Path::new(&file.path), on) {
            for p in done.into_iter().rev() {
                let _ = platform::activate(p, !on);
            }
            return Err(format!("{}: {e}", record.family));
        }
        done.push(Path::new(&file.path));
    }
    Ok(())
}
pub fn reconcile(state: &ManagerState, next: &Library) -> Result<(), String> {
    let mut active = state.active.lock().map_err(|_| "Font activation is busy")?;
    let mut changed: Vec<(&Record, bool)> = vec![];
    for (id, r) in &next.fonts {
        let on = wanted(next, id);
        if active.contains(id) == on {
            continue;
        }
        if let Err(e) = set_record(r, on) {
            for (r, was_on) in changed.into_iter().rev() {
                let _ = set_record(r, !was_on);
            }
            return Err(e);
        }
        changed.push((r, on));
    }
    for (r, on) in changed {
        if on {
            active.insert(r.id.clone());
        } else {
            active.remove(&r.id);
        }
    }
    Ok(())
}
pub fn font_file(path: &Path, bytes: &[u8]) -> Result<FontFile, String> {
    let face =
        ttf_parser::Face::parse(bytes, 0).map_err(|_| "This is not a supported TTF or OTF font")?;
    let weight = face
        .variation_axes()
        .into_iter()
        .find(|a| a.tag == ttf_parser::Tag::from_bytes(b"wght"))
        .map(|a| format!("{} {}", a.min_value, a.max_value))
        .unwrap_or_else(|| face.weight().to_number().to_string());
    Ok(FontFile {
        path: path.to_string_lossy().into(),
        weight,
        style: if face.is_italic() { "italic" } else { "normal" }.into(),
    })
}
fn disk_key(id: &str) -> String {
    format!("{:x}", Sha256::digest(id.as_bytes()))
}
fn check_url(url: &str) -> Result<(), String> {
    let u = reqwest::Url::parse(url).map_err(|_| "Invalid download URL")?;
    if u.scheme() != "https"
        || !matches!(
            u.host_str(),
            Some("raw.githubusercontent.com" | "cdn.jsdelivr.net")
        )
    {
        return Err("Download source is not supported".into());
    }
    Ok(())
}
async fn fetch(asset: &Asset, state: &ManagerState) -> Result<Vec<u8>, String> {
    check_url(&asset.url)?;
    let client = reqwest::Client::builder()
        .user_agent("OpenShelf/0.1")
        .timeout(std::time::Duration::from_secs(120))
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| e.to_string())?;
    let mut r = client
        .get(&asset.url)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .error_for_status()
        .map_err(|e| e.to_string())?;
    let mut bytes = Vec::new();
    while let Some(chunk) = r.chunk().await.map_err(|e| e.to_string())? {
        if state.cancel.load(Ordering::Relaxed) {
            return Err("Download cancelled".into());
        }
        if bytes.len() + chunk.len() > 50 * 1024 * 1024 {
            return Err("Font file exceeds the 50 MB limit".into());
        }
        bytes.extend_from_slice(&chunk);
    }
    if !asset.hash.is_empty() {
        let mut hash = sha1::Sha1::new();
        hash.update(format!("blob {}\0", bytes.len()));
        hash.update(&bytes);
        if format!("{:x}", hash.finalize()) != asset.hash {
            return Err("Downloaded file did not match its source checksum".into());
        }
    }
    Ok(bytes)
}
#[tauri::command]
pub async fn device_state(
    app: AppHandle,
    state: tauri::State<'_, ManagerState>,
) -> Result<Snapshot, String> {
    let data = state.data.lock().await;
    Ok(Snapshot {
        fonts: data.fonts.values().cloned().collect(),
        active: state
            .active
            .lock()
            .map_err(|_| "Activation is busy")?
            .iter()
            .cloned()
            .collect(),
        groups: data.groups.clone(),
        offline: data.offline,
        system: state.system.clone(),
        downloadable: state.index.keys().cloned().collect(),
        version: app.package_info().version.to_string(),
        updates_configured: option_env!("OPEN_SHELF_UPDATER_PUBLIC_KEY").is_some(),
    })
}
#[tauri::command]
pub async fn set_offline(
    app: AppHandle,
    state: tauri::State<'_, ManagerState>,
    offline: bool,
) -> Result<(), String> {
    let mut data = state.data.lock().await;
    let mut next = data.clone();
    next.offline = offline;
    save(&app, &next)?;
    *data = next;
    if offline {
        state.cancel.store(true, Ordering::Relaxed);
    }
    Ok(())
}
#[tauri::command]
pub fn cancel_download(state: tauri::State<'_, ManagerState>) {
    state.cancel.store(true, Ordering::Relaxed);
}
#[tauri::command]
pub async fn download_family(
    app: AppHandle,
    state: tauri::State<'_, ManagerState>,
    id: String,
) -> Result<(), String> {
    let _job = state
        .download_lock
        .try_lock()
        .map_err(|_| "Another download is already running")?;
    {
        let data = state.data.lock().await;
        if data.offline {
            return Err("Turn off offline mode to download fonts".into());
        }
        if data.fonts.contains_key(&id) {
            return Ok(());
        }
    }
    let f = state
        .index
        .get(&id)
        .ok_or("Installable files are not available for this family")?
        .clone();
    state.cancel.store(false, Ordering::Relaxed);
    let fonts_root = root(&app)?.join("fonts");
    fs::create_dir_all(&fonts_root).map_err(|e| e.to_string())?;
    let temp = tempfile::tempdir_in(&fonts_root).map_err(|e| e.to_string())?;
    let dest = fonts_root.join(disk_key(&id));
    let mut files = vec![];
    let mut total = 0u64;
    for (i, a) in f.licences.iter().chain(&f.files).enumerate() {
        let _=app.emit("font-download",serde_json::json!({"family":f.family,"completed":i,"total":f.files.len()+f.licences.len()}));
        let bytes = fetch(a, &state).await?;
        total += bytes.len() as u64;
        if total > 350 * 1024 * 1024 {
            return Err("Family exceeds the 350 MB download limit".into());
        }
        let filename = Path::new(&a.name).file_name().ok_or("Invalid filename")?;
        let p = temp.path().join(filename);
        fs::write(&p, &bytes).map_err(|e| e.to_string())?;
        if i >= f.licences.len() {
            files.push(font_file(&dest.join(filename), &bytes)?);
        }
    }
    let mut data = state.data.lock().await;
    if data.offline || state.cancel.load(Ordering::Relaxed) {
        return Err("Download cancelled".into());
    }
    // Quarantine only an unreferenced app-owned folder left by an interrupted download.
    if dest.exists() {
        let orphan = fonts_root.join(format!(
            "incomplete-{}-{}",
            disk_key(&id),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map_err(|e| e.to_string())?
                .as_millis()
        ));
        fs::rename(&dest, orphan).map_err(|e| e.to_string())?;
    }
    fs::rename(temp.path(), &dest).map_err(|e| e.to_string())?;
    let mut next = data.clone();
    next.fonts.insert(
        id.clone(),
        Record {
            id,
            family: f.family,
            source: f.source,
            coverage: f.coverage,
            files,
            bytes: total,
            manual: false,
            description: String::new(),
            designer: String::new(),
            category: String::new(),
            tags: String::new(),
        },
    );
    if let Err(e) = save(&app, &next) {
        let _ = fs::remove_dir_all(dest);
        return Err(e);
    }
    *data = next;
    Ok(())
}
#[tauri::command]
pub async fn set_activation(
    app: AppHandle,
    state: tauri::State<'_, ManagerState>,
    ids: Vec<String>,
    group: Option<String>,
    on: bool,
) -> Result<(), String> {
    let mut data = state.data.lock().await;
    let mut next = data.clone();
    if ids.iter().any(|id| !next.fonts.contains_key(id)) {
        return Err("Download these fonts before enabling them".into());
    }
    if let Some(group) = group {
        if group.len() > 100 {
            return Err("Invalid collection".into());
        }
        if on {
            next.groups.insert(group, ids.into_iter().collect());
        } else {
            next.groups.remove(&group);
        }
    } else {
        for id in ids {
            next.fonts.get_mut(&id).unwrap().manual = on;
        }
    }
    reconcile(&state, &next)?;
    if let Err(e) = save(&app, &next) {
        let _ = reconcile(&state, &data);
        return Err(e);
    }
    *data = next;
    Ok(())
}
#[tauri::command]
pub async fn edit_font(
    app: AppHandle,
    state: tauri::State<'_, ManagerState>,
    id: String,
    description: String,
    category: String,
    designer: String,
    tags: String,
) -> Result<(), String> {
    let mut data = state.data.lock().await;
    let mut next = data.clone();
    let r = next.fonts.get_mut(&id).ok_or("Font not found")?;
    r.description = description.chars().take(3000).collect();
    r.category = category.chars().take(80).collect();
    r.designer = designer.chars().take(200).collect();
    r.tags = tags.chars().take(500).collect();
    save(&app, &next)?;
    *data = next;
    Ok(())
}
#[tauri::command]
pub async fn import_fonts(
    app: AppHandle,
    state: tauri::State<'_, ManagerState>,
) -> Result<usize, String> {
    use tauri_plugin_dialog::DialogExt;
    let picked = app
        .dialog()
        .file()
        .add_filter("Desktop fonts", &["ttf", "otf"])
        .blocking_pick_files();
    let Some(picked) = picked else { return Ok(0) };
    let mut added = 0;
    for p in picked {
        let path = p.into_path().map_err(|e| e.to_string())?;
        let size = fs::metadata(&path).map_err(|e| e.to_string())?.len();
        if size > 50 * 1024 * 1024 {
            return Err("Imported font exceeds 50 MB".into());
        }
        let bytes = fs::read(&path).map_err(|e| e.to_string())?;
        let id = format!("local-{:x}", Sha256::digest(&bytes));
        let mut data = state.data.lock().await;
        if data.fonts.contains_key(&id) {
            continue;
        }
        let dest = root(&app)?.join("fonts").join(disk_key(&id));
        let ext = if bytes.starts_with(b"OTTO") {
            "otf"
        } else {
            "ttf"
        };
        let target = dest.join(format!("font.{ext}"));
        let file = font_file(&target, &bytes)?;
        let face = ttf_parser::Face::parse(&bytes, 0).map_err(|_| "Invalid font")?;
        let family = face
            .names()
            .into_iter()
            .find_map(|n| {
                if n.name_id == ttf_parser::name_id::TYPOGRAPHIC_FAMILY
                    || n.name_id == ttf_parser::name_id::FAMILY
                {
                    n.to_string()
                } else {
                    None
                }
            })
            .unwrap_or_else(|| {
                path.file_stem()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .into()
            });
        fs::create_dir_all(&dest).map_err(|e| e.to_string())?;
        fs::write(&target, &bytes).map_err(|e| e.to_string())?;
        let mut next = data.clone();
        next.fonts.insert(
            id.clone(),
            Record {
                id,
                family,
                source: "Imported".into(),
                coverage: "Original file".into(),
                files: vec![file],
                bytes: size,
                manual: false,
                description: String::new(),
                category: String::new(),
                designer: String::new(),
                tags: String::new(),
            },
        );
        save(&app, &next)?;
        *data = next;
        added += 1;
    }
    Ok(added)
}

#[tauri::command]
pub async fn export_fonts(
    app: AppHandle,
    state: tauri::State<'_, ManagerState>,
) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;
    let Some(folder) = app.dialog().file().blocking_pick_folder() else {
        return Ok("Export cancelled".into());
    };
    let parent = folder.into_path().map_err(|e| e.to_string())?;
    let data = state.data.lock().await.clone();
    let stamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis();
    let out = parent.join(format!("OpenShelf fonts {stamp}"));
    fs::create_dir(&out).map_err(|e| e.to_string())?;
    let mut portable = data.clone();
    for r in portable.fonts.values_mut() {
        let dir = out.join(disk_key(&r.id));
        fs::create_dir(&dir).map_err(|e| e.to_string())?;
        for file in &mut r.files {
            let old = PathBuf::from(&file.path);
            let name = old.file_name().ok_or("Invalid stored filename")?;
            fs::copy(&old, dir.join(name)).map_err(|e| e.to_string())?;
            file.path = format!("{}/{}", disk_key(&r.id), name.to_string_lossy());
        }
        let source = root(&app)?.join("fonts").join(disk_key(&r.id));
        for entry in fs::read_dir(source).map_err(|e| e.to_string())? {
            let p = entry.map_err(|e| e.to_string())?.path();
            if p.extension().is_some_and(|e| e == "txt") {
                fs::copy(&p, dir.join(p.file_name().unwrap())).map_err(|e| e.to_string())?;
            }
        }
    }
    fs::write(
        out.join("library.json"),
        serde_json::to_vec_pretty(&portable).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    Ok(format!(
        "Exported {} families with their font files and metadata.",
        portable.fonts.len()
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    fn record() -> Record {
        Record {
            id: "a".into(),
            family: "A".into(),
            source: "test".into(),
            coverage: "".into(),
            files: vec![],
            bytes: 0,
            description: "".into(),
            category: "".into(),
            designer: "".into(),
            tags: "".into(),
            manual: false,
        }
    }
    #[test]
    fn collection_overlap_preserves_activation() {
        let mut d = Library::default();
        d.fonts.insert("a".into(), record());
        d.groups.insert("one".into(), BTreeSet::from(["a".into()]));
        d.groups.insert("two".into(), BTreeSet::from(["a".into()]));
        d.groups.remove("one");
        assert!(wanted(&d, "a"));
        d.groups.remove("two");
        assert!(!wanted(&d, "a"));
        d.fonts.get_mut("a").unwrap().manual = true;
        assert!(wanted(&d, "a"));
    }
    #[test]
    fn unsafe_download_hosts_rejected() {
        assert!(check_url("https://raw.githubusercontent.com/google/fonts/a").is_ok());
        assert!(check_url("https://example.com/font.ttf").is_err());
        assert!(check_url("file:///etc/passwd").is_err());
        assert!(check_url("http://cdn.jsdelivr.net/font.ttf").is_err());
    }
    #[test]
    fn invalid_font_rejected() {
        assert!(font_file(Path::new("test.ttf"), b"<html>Not a font</html>").is_err());
    }
}

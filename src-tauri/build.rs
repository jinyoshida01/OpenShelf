fn main() {
    println!("cargo:rerun-if-env-changed=OPEN_SHELF_UPDATER_PUBLIC_KEY");
    tauri_build::build()
}

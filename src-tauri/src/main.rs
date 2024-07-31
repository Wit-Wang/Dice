// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use crate::utils::set_window_shadow;

mod utils;

#[tauri::command]
fn set_window_always_on_top(data: bool, window: tauri::Window){
    let _ = window.set_always_on_top(data);
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            set_window_shadow(app);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![set_window_always_on_top])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
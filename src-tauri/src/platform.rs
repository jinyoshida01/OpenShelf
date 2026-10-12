use std::path::Path;

#[cfg(target_os = "macos")]
pub fn activate(path: &Path, on: bool) -> Result<(), String> {
    use core_foundation::{
        base::TCFType,
        error::{CFError, CFErrorRef},
        url::{CFURLRef, CFURL},
    };
    #[link(name = "CoreText", kind = "framework")]
    extern "C" {
        fn CTFontManagerRegisterFontsForURL(
            url: CFURLRef,
            scope: u32,
            error: *mut CFErrorRef,
        ) -> bool;
        fn CTFontManagerUnregisterFontsForURL(
            url: CFURLRef,
            scope: u32,
            error: *mut CFErrorRef,
        ) -> bool;
    }
    let url = CFURL::from_path(path, false).ok_or("Invalid font path")?;
    let mut error = std::ptr::null_mut();
    // Session scope exposes the font to other apps without copying into system folders.
    const SESSION_SCOPE: u32 = 3;
    let ok = unsafe {
        if on {
            CTFontManagerRegisterFontsForURL(url.as_concrete_TypeRef(), SESSION_SCOPE, &mut error)
        } else {
            CTFontManagerUnregisterFontsForURL(url.as_concrete_TypeRef(), SESSION_SCOPE, &mut error)
        }
    };
    if ok {
        return Ok(());
    }
    if !error.is_null() {
        return Err(format!("{}", unsafe {
            CFError::wrap_under_create_rule(error)
        }));
    }
    Err("The system could not change this font. It may already be installed elsewhere.".into())
}

#[cfg(windows)]
pub fn activate(path: &Path, on: bool) -> Result<(), String> {
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::{
        Graphics::Gdi::{AddFontResourceExW, RemoveFontResourceExW},
        UI::WindowsAndMessaging::{
            SendMessageTimeoutW, HWND_BROADCAST, SMTO_ABORTIFHUNG, WM_FONTCHANGE,
        },
    };
    let wide: Vec<u16> = path.as_os_str().encode_wide().chain(Some(0)).collect();
    let ok = unsafe {
        if on {
            AddFontResourceExW(wide.as_ptr(), 0, std::ptr::null()) > 0
        } else {
            RemoveFontResourceExW(wide.as_ptr(), 0, std::ptr::null()) != 0
        }
    };
    if !ok {
        return Err(
            "Windows could not change this font. It may already be installed or in use.".into(),
        );
    }
    unsafe {
        SendMessageTimeoutW(
            HWND_BROADCAST,
            WM_FONTCHANGE,
            0,
            0,
            SMTO_ABORTIFHUNG,
            200,
            std::ptr::null_mut(),
        );
    }
    Ok(())
}

#[cfg(not(any(target_os = "macos", windows)))]
pub fn activate(_: &Path, _: bool) -> Result<(), String> {
    Err("Font activation is supported on macOS and Windows.".into())
}

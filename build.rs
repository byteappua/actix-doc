use std::fs;
use std::path::Path;
use std::process::Command;

fn main() {
    println!("cargo::rerun-if-changed=front/src");
    println!("cargo::rerun-if-changed=front/package.json");

    // Check if static directory exists, create if not
    if !Path::new("static").exists() {
        fs::create_dir("static").expect("Failed to create static directory");
    }

    // Check if front/out exists
    let out_dir = Path::new("front/out");

    if !out_dir.exists() {
        println!("cargo::warning=Frontend not built. Running npm run build...");

        // Run npm install if node_modules doesn't exist
        if !Path::new("front/node_modules").exists() {
            println!("cargo::warning=Installing frontend dependencies...");
            let npm_install = if cfg!(target_os = "windows") {
                Command::new("cmd")
                    .args(["/C", "npm", "install"])
                    .current_dir("front")
                    .status()
            } else {
                Command::new("npm")
                    .arg("install")
                    .current_dir("front")
                    .status()
            };

            if let Err(e) = npm_install {
                println!("cargo::warning=Failed to run npm install: {}", e);
                return;
            }
        }

        // Run npm run build
        let npm_build = if cfg!(target_os = "windows") {
            Command::new("cmd")
                .args(["/C", "npm", "run", "build"])
                .current_dir("front")
                .status()
        } else {
            Command::new("npm")
                .args(["run", "build"])
                .current_dir("front")
                .status()
        };

        match npm_build {
            Ok(status) if status.success() => {
                println!("cargo::warning=Frontend build completed successfully");
            }
            Ok(status) => {
                println!(
                    "cargo::warning=Frontend build failed with status: {}",
                    status
                );
                return;
            }
            Err(e) => {
                println!("cargo::warning=Failed to run npm build: {}", e);
                return;
            }
        }
    }

    // Copy files from front/out to static
    if out_dir.exists() {
        println!("cargo::warning=Copying frontend files to static/...");

        // Clean static directory first (except .gitkeep if exists)
        if let Ok(entries) = fs::read_dir("static") {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.file_name().and_then(|n| n.to_str()) != Some(".gitkeep") {
                    if path.is_dir() {
                        let _ = fs::remove_dir_all(&path);
                    } else {
                        let _ = fs::remove_file(&path);
                    }
                }
            }
        }

        // Copy recursively
        if let Err(e) = copy_dir_all("front/out", "static") {
            println!("cargo::warning=Failed to copy frontend files: {}", e);
        } else {
            println!("cargo::warning=Frontend files copied successfully");
        }
    }
}

fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> std::io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}

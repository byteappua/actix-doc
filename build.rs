use std::fs;
use std::path::Path;
use std::process::Command;
use std::time::SystemTime;

fn main() {
    println!("cargo::rerun-if-changed=front/src");
    println!("cargo::rerun-if-changed=front/package.json");
    println!("cargo::rerun-if-env-changed=REBUILD_FRONT");

    // Check if static directory exists, create if not
    if !Path::new("static").exists() {
        fs::create_dir("static").expect("Failed to create static directory");
    }

    // Determine if we need to rebuild frontend
    let should_rebuild = should_rebuild_frontend();

    if should_rebuild {
        println!("cargo::warning=Frontend rebuild triggered");

        // Run pnpm install if node_modules doesn't exist
        if !Path::new("front/node_modules").exists() {
            println!("cargo::warning=Installing frontend dependencies...");
            let pnpm_install = if cfg!(target_os = "windows") {
                Command::new("cmd")
                    .args(["/C", "pnpm", "install"])
                    .current_dir("front")
                    .status()
            } else {
                Command::new("pnpm")
                    .arg("install")
                    .current_dir("front")
                    .status()
            };

            if let Err(e) = pnpm_install {
                println!("cargo::warning=Failed to run pnpm install: {}", e);
                return;
            }
        }

        // Run pnpm run build
        println!("cargo::warning=Building frontend...");
        let pnpm_build = if cfg!(target_os = "windows") {
            Command::new("cmd")
                .args(["/C", "pnpm", "run", "build"])
                .current_dir("front")
                .status()
        } else {
            Command::new("pnpm")
                .args(["run", "build"])
                .current_dir("front")
                .status()
        };

        match pnpm_build {
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
                println!("cargo::warning=Failed to run pnpm build: {}", e);
                return;
            }
        }
    }

    // Copy files from front/out to static
    let out_dir = Path::new("front/out");
    if out_dir.exists() {
        println!("cargo::warning=Copying frontend files to static/...");

        // Clean static directory first
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
    } else {
        println!("cargo::warning=Frontend output directory not found. Run with REBUILD_FRONT=1");
    }
}

fn should_rebuild_frontend() -> bool {
    // Check environment variable first
    if std::env::var("REBUILD_FRONT").is_ok() {
        println!("cargo::warning=REBUILD_FRONT env var detected");
        return true;
    }

    let out_dir = Path::new("front/out");

    // If out directory doesn't exist, must rebuild
    if !out_dir.exists() {
        println!("cargo::warning=Output directory doesn't exist");
        return true;
    }

    // Check if front/src is newer than front/out
    if let Ok(src_time) = get_dir_modified_time("front/src") {
        if let Ok(out_time) = get_dir_modified_time("front/out") {
            if src_time > out_time {
                println!("cargo::warning=Source files newer than build output");
                return true;
            }
        }
    }

    // Check if package.json is newer than out
    if let Ok(pkg_meta) = fs::metadata("front/package.json") {
        if let Ok(pkg_time) = pkg_meta.modified() {
            if let Ok(out_time) = get_dir_modified_time("front/out") {
                if pkg_time > out_time {
                    println!("cargo::warning=package.json modified");
                    return true;
                }
            }
        }
    }

    false
}

fn get_dir_modified_time(dir: &str) -> Result<SystemTime, std::io::Error> {
    let mut latest = SystemTime::UNIX_EPOCH;

    fn visit_dirs(dir: &Path, latest: &mut SystemTime) -> std::io::Result<()> {
        if dir.is_dir() {
            for entry in fs::read_dir(dir)? {
                let entry = entry?;
                let path = entry.path();

                // Skip node_modules and .next
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    if name == "node_modules" || name == ".next" {
                        continue;
                    }
                }

                if path.is_dir() {
                    visit_dirs(&path, latest)?;
                } else {
                    if let Ok(metadata) = fs::metadata(&path) {
                        if let Ok(modified) = metadata.modified() {
                            if modified > *latest {
                                *latest = modified;
                            }
                        }
                    }
                }
            }
        }
        Ok(())
    }

    visit_dirs(Path::new(dir), &mut latest)?;
    Ok(latest)
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

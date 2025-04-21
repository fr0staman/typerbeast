use argon2::password_hash::{SaltString, rand_core::OsRng};
use argon2::{Algorithm, Argon2, Params, PasswordHash, PasswordHasher, Version};

pub fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    let argon2_settings = get_argon2_settings();

    let salt = SaltString::generate(&mut OsRng);

    let hash = argon2_settings.hash_password(password.as_bytes(), &salt)?;
    Ok(hash.to_string())
}

pub fn verify_password(password: String, hash: String) -> Result<(), argon2::password_hash::Error> {
    let argon2_settings = get_argon2_settings();
    let hash = PasswordHash::new(&hash)?;

    hash.verify_password(&[&argon2_settings], password)?;

    Ok(())
}

fn get_argon2_settings() -> Argon2<'static> {
    Argon2::new(Algorithm::Argon2id, Version::V0x13, Params::new(1024 * 32, 1, 1, None).unwrap())
}

use serde::{Deserialize, Serialize};

#[derive(
    diesel_derive_enum::DbEnum, PartialEq, Debug, Serialize, Deserialize, Clone, utoipa::ToSchema,
)]
#[db_enum(existing_type_path = "crate::db::schema::sql_types::ReviewTextStatus")]
pub enum ReviewTextStatus {
    Pending,
    Approved,
    Rejected,
}

#[derive(
    diesel_derive_enum::DbEnum, PartialEq, Debug, Serialize, Deserialize, Clone, utoipa::ToSchema,
)]
#[db_enum(existing_type_path = "crate::db::schema::sql_types::UserRoles")]
pub enum UserRoles {
    Creator,
    Moderator,
    User,
}

#[derive(
    diesel_derive_enum::DbEnum, PartialEq, Debug, Serialize, Deserialize, Clone, utoipa::ToSchema,
)]
#[db_enum(existing_type_path = "crate::db::schema::sql_types::Leagues")]
pub enum Leagues {
    Mobile,
    Web,
}

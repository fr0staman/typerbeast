use serde::{Deserialize, Serialize};

#[derive(
    diesel_derive_enum::DbEnum, PartialEq, Debug, Serialize, Deserialize, Clone, utoipa::ToSchema,
)]
#[db_enum(existing_type_path = "crate::db::schema::sql_types::Reviewtextstatus")]
pub enum ReviewTextStatus {
    Pending,
    Approved,
    Rejected,
}

#[derive(
    diesel_derive_enum::DbEnum, PartialEq, Debug, Serialize, Deserialize, Clone, utoipa::ToSchema,
)]
#[db_enum(existing_type_path = "crate::db::schema::sql_types::Userroles")]
pub enum UserRoles {
    Creator,
    Moderator,
    User,
}

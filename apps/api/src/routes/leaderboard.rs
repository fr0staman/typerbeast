use axum::{
    Json,
    extract::{Query, State},
};
use serde::Serialize;

use crate::{
    app::{auth::Claims, state::AppState, types::MyResult},
    db::models::result::{Results, TopQuery, TopUser},
};

#[derive(Serialize, utoipa::ToSchema)]
pub struct LeaderboardResponse {
    pub users: Vec<TopUser>,
}

#[utoipa::path(
    get,
    path = "/api/v1/leaderboard",
    params(TopQuery),
    responses(
        (status = 200, description = "Top users", body = LeaderboardResponse)
    )
)]
pub async fn get_leaderboard(
    _: Claims,
    State(state): State<AppState>,
    Query(params): Query<TopQuery>,
) -> MyResult<Json<LeaderboardResponse>> {
    let mut conn = state.db().await?;
    let mut params = params;

    params.dictionary_id = Some(params.dictionary_id.unwrap_or(state.config.default_dictionary_id));

    let result = Results::get_leaderboard(&mut conn, params).await?;

    let leaderboard_result = LeaderboardResponse { users: result };

    Ok(Json(leaderboard_result))
}

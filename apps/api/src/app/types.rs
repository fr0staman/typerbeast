use diesel_async::pooled_connection::deadpool::Pool;

use super::error::MyError;

pub type DbConn = diesel_async::AsyncPgConnection;
pub type DbPool = Pool<DbConn>;

pub type DeadpoolResult = Result<
    diesel_async::pooled_connection::deadpool::Object<DbConn>,
    diesel_async::pooled_connection::deadpool::PoolError,
>;
pub type MyResult<T> = Result<T, MyError>;

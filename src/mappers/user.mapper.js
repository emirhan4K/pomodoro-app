class UserMapper{
    static toResponse(user){
        return{
            id:user._id.toString(),
            username:user.username,
            email:user.email,
            role:user.role
        }
    }
}

module.exports = UserMapper;
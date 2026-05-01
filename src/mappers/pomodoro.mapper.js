class PomodoroMapper{
    static toResponse(session){
        return{
            id:session._id.toString(),
            user:session.user,
            duration:session.duration,
            category:session.category,
            status:session.status,
            createdAt:session.createdAt
        }
    }
}

module.exports = PomodoroMapper;
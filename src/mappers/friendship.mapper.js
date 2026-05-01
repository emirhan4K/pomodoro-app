class FriendshipMapper{
    static toResponse(request){
        return{
            id:request._id.toString(),
            requester:request.requester,
            recipient:request.recipient,
            status:request.status,
            createdAt:request.createdAt
        }
    }
}

module.exports = FriendshipMapper;
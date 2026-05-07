class RoomMapper {
    static toDTO(room) {
        if (!room) return null;
        
        return {
            id: room._id ? room._id.toString() : room.id,
            slug: room.slug,
            roomName: room.roomName,
            description: room.description,
            capacity: room.capacity,
            isPrivate: room.isPrivate,
            isActive: room.isActive,
            roomAvatar: room.roomAvatar || "default-room.png",
            roomBanner: room.roomBanner || "default-room-banner.png",
            category: room.category || "Çalışma Alanı", 
            owner: room.owner ? (room.owner._id ? room.owner._id.toString() : room.owner.toString()) : null,
            
            members: room.members ? room.members.map(member => {
                if (member && typeof member === 'object') {
                    return {
                        id: member._id ? member._id.toString() : (member.id || member),
                        username: member.username || member.name || "Kullanıcı"
                    };
                }
                return member ? member.toString() : null;
            }).filter(m => m !== null) : [],
            
            createdAt: room.createdAt
        };
    }
    static toDTOList(rooms) {
        return (rooms || []).map(room => this.toDTO(room));
    }
}

module.exports = RoomMapper;
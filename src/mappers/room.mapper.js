class RoomMapper {
    // Tek bir odayı temizlemek için
    static toDTO(room) {
        if (!room) return null;
        
        return {
            id: room._id ? room._id.toString() : room.id,
            roomName: room.roomName,
            description: room.description,
            capacity: room.capacity,
            isPrivate: room.isPrivate,
            isActive: room.isActive,
            category: room.category || "Çalışma Alanı", 

            owner: room.owner?._id ? room.owner._id.toString() : room.owner?.toString(),
            members: room.members ? room.members.map(member => {
                if (typeof member === 'object' && member !== null) {
                    return {
                        id: member._id ? member._id.toString() : member.id,
                        username: member.username || member.name || "Kullanıcı"
                    };
                }
                return member.toString();
            }) : [],
            
            createdAt: room.createdAt
        };
    }
    static toDTOList(rooms) {
        return rooms.map(room => this.toDTO(room));
    }
}

module.exports = RoomMapper;
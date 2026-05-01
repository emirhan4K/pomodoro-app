class FriendshipController {
  constructor({ friendshipService }) {
    this.friendshipService = friendshipService;
  }
  sendRequest = async (req, res, next) => {
    try {
      const requesterId = req.user.id;
      const { recipientId } = req.body;
      const request = await this.friendshipService.sendRequest(
        requesterId,
        recipientId,
      );
      res.status(201).json(request);
    } catch (error) {
         next(error);
    }
  };
  respondToRequest = async(req,res,next) => {
    try {
      const requestId = req.params.id;
      const recipientId = req.user.id;
      const { action } = req.body;

      const updatedRequest =
        await this.friendshipService.respondToRequest(
          requestId,
          recipientId,
          action
        );

      res.status(200).json(updatedRequest);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FriendshipController;

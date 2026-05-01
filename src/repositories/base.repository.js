class BaseRepository {
  constructor(model) {
    this.model = model;
  }
  create(data) {
    return this.model.create(data);
  }
  find(populate){
    return this.model.find(populate)
  }
  findById(id) {
    return this.model.findById(id);
  }
  findOne(query) {
    return this.model.findOne(query);
  }
  update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }
  delete(id){
    return this.model.findByIdAndDelete(id);
  }
}

module.exports = BaseRepository;

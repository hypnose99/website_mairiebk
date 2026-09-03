module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    
    if (!data.date_publication) {
      data.date_publication = new Date();
    }
  },
};
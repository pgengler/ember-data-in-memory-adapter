import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.find('event');
  },

  afterModel() {
    this.store.createRecord('event', {
      timestamp: (new Date()),
      content: 'New event'
    });
  }
});

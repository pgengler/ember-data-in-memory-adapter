import DS from 'ember-data';
import Ember from 'ember';

let indexOf = Array.prototype.indexOf && function(array, item) {
  return array.indexOf(item);
} || Ember.EnumerableUtils.indexOf;

export default DS.Adapter.extend({
  defaultSerializer: '-default',

  data: { },

  // The fixture adapter does not support coalesceFindRequests
  coalesceFindRequests: false,

  /**
    If `simulateRemoteResponse` is `true` the `InMemoryAdapter` will
    wait a number of milliseconds before resolving promises with the
    fixture values. The wait time can be configured via the `latency`
    property.
    @property simulateRemoteResponse
    @type {Boolean}
    @default true
  */
  simulateRemoteResponse: true,

  /**
    By default the `InMemoryAdapter` will simulate a wait of the
    `latency` milliseconds before resolving promises with the fixture
    values. This behavior can be turned off via the
    `simulateRemoteResponse` property.
    @property latency
    @type {Number}
    @default 50
  */
  latency: 50,

  /**
    Implement this method in order to provide data associated with a type
    @method dataForType
    @param {Subclass of DS.Model} typeClass
    @return {Array}
  */
  dataForType(typeClass) {
    this.data[typeClass] = this.data[typeClass] || Ember.A();
    return this.data[typeClass];
  },

  /**
    Implement this method in order to query in-memory data
    @method queryData
    @param {Array} data
    @param {Object} query
    @param {Subclass of DS.Model} typeClass
    @return {Promise|Array}
  */
  queryData(/*fixtures, query, typeClass*/) {
    Ember.assert('Not implemented: You must override the DS.InMemoryAdapter::queryFixtures method to support querying the in-memory store.');
  },

  /**
    @method updateFixtures
    @param {Subclass of DS.Model} typeClass
    @param {Array} fixture
  */
  updateData(typeClass, data) {
    let typeData = this.dataForType(typeClass);

    typeData.pushObjects(data);
  },

  /**
    Implement this method in order to provide json for CRUD methods
    @method mockJSON
    @param {DS.Store} store
    @param {Subclass of DS.Model} typeClass
    @param {DS.Snapshot} snapshot
  */
  mockJSON(store, typeClass, snapshot) {
    return store.serializerFor(snapshot.modelName).serialize(snapshot, { includeId: true });
  },

  /**
    @method find
    @param {DS.Store} store
    @param {subclass of DS.Model} typeClass
    @param {String} id
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  find(store, typeClass, id/*, snapshot*/) {
    let data = this.dataForType(typeClass);
    let item = data.findBy('id', id);

    if (item) {
      return this.simulateRemoteCall(() => item);
    }
  },

  /**
    @method findMany
    @param {DS.Store} store
    @param {subclass of DS.Model} typeClass
    @param {Array} ids
    @param {Array} snapshots
    @return {Promise} promise
  */
  findMany(store, typeClass, ids/*, snapshots*/) {
    let data = this.dataForType(typeClass);
    let matches = data.filter(item => indexOf(ids, item.id) !== -1);

    if (matches) {
      return this.simulateRemoteCall(() => matches);
    }
  },

  /**
    @private
    @method findAll
    @param {DS.Store} store
    @param {subclass of DS.Model} typeClass
    @param {String} sinceToken
    @return {Promise} promise
  */
  findAll(store, typeClass) {
    let data = this.dataForType(typeClass);

    return this.simulateRemoteCall(() => data);
  },

  /**
    @private
    @method findQuery
    @param {DS.Store} store
    @param {subclass of DS.Model} typeClass
    @param {Object} query
    @param {DS.AdapterPopulatedRecordArray} recordArray
    @return {Promise} promise
  */
  findQuery(store, typeClass, query/*, array*/) {
    let data = this.dataForType(typeClass);

    let matches = this.queryData(data, query, typeClass);

    if (matches) {
      return this.simulateRemoteCall(() => matches);
    }
  },

  /**
    @method createRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} typeClass
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  createRecord(store, typeClass, snapshot) {
    let data = this.mockJSON(store, typeClass, snapshot);

    this.updateData(typeClass, data);

    return this.simulateRemoteCall(() => data);
  },

  /**
    @method updateRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} type
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  updateRecord(store, typeClass, snapshot) {
    let data = this.mockJSON(store, typeClass, snapshot);

    this.updateData(typeClass, data);

    return this.simulateRemoteCall(() => data);
  },

  /**
    @method deleteRecord
    @param {DS.Store} store
    @param {subclass of DS.Model} typeClass
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
  */
  deleteRecord(store, typeClass, snapshot) {
    this.deleteLoadedItem(typeClass, snapshot);

    return this.simulateRemoteCall(() => null);
  },

  /*
    @method deleteLoadedItem
    @private
    @param typeClass
    @param snapshot
  */
  deleteLoadedItem(typeClass, snapshot) {
    let existingItem = this.findExistingItem(typeClass, snapshot);

    if (existingItem) {
      let data = this.dataForType(typeClass);
      let index = indexOf(data, existingItem);
      data.splice(index, 1);
      return true;
    }
  },

  /*
    @method findExistingItem
    @private
    @param typeClass
    @param snapshot
  */
  findExistingFixture(typeClass, snapshot) {
    let data = this.dataForType(typeClass);
    let id = snapshot.id;

    return this.findItemById(data, id);
  },

  /*
    @method findFixtureById
    @private
    @param fixtures
    @param id
  */
  findItemById(data, id) {
    return data.find((r) => '' + get(r, 'id') === '' + id);
  },

  /*
    @method simulateRemoteCall
    @private
    @param callback
    @param context
  */
  simulateRemoteCall(callback, context) {
    let adapter = this;

    return new Ember.RSVP.Promise(function(resolve) {
      let value = Ember.copy(callback.call(context), true);
      if (get(adapter, 'simulateRemoteResponse')) {
        // Schedule with setTimeout
        Ember.run.later(null, resolve, value, get(adapter, 'latency'));
      } else {
        // Asynchronous, but at the of the runloop with zero latency
        resolve(value);
      }
    }, 'DS: InMemoryAdapter#simulateRemoteCall');
  }
});

import * as _ from "lodash";
import * as Hapi from "hapi";
import {heroes as mockHeroes} from "./data";

export const url: string = "http://0.0.0.0:8000";
export const server = new Hapi.Server();
server.connection({ host: '0.0.0.0', port: 8000 });

let id = 4;
let heroes = _.cloneDeep(mockHeroes);

// find
server.route({
  method: 'GET',
  path: '/heroes',
  handler: (request, reply) => reply(heroes || [])
});

// find one
server.route({
  method: 'GET',
  path: '/heroes/{id}',
  handler: (request, reply) => {
    const hero = _.find(heroes, {id: parseInt(request.params["id"])}) || false;
    reply(hero);
  }
});

// create
server.route({
  method: 'POST',
  path: '/heroes',
  handler: (request, reply) => {
    const entry = _.cloneDeep(request.payload);
    entry.id = id++;
    heroes.push(entry);
    reply(entry);
  }
});

// save
server.route({
  method: 'PUT',
  path: '/heroes/{id}',
  handler: (request, reply) => {
    const hero = _.find(heroes, {id: parseInt(request.params["id"])});
    _.extend(hero, request.payload);
    reply(hero);
  }
});

// destroy
server.route({
  method: 'DELETE',
  path: '/heroes/{id}',
  handler: (request, reply) => {
    const hero = _.find(heroes, {id: parseInt(request.params["id"])}) || null;
    heroes = _.reject(heroes, {id: parseInt(request.params["id"])});
    reply(hero);
  }
});

var express = require("express");
var server = express();
var bodyParser = require("body-parser");

//------- Objeto con sus props ---------


var model = {

    clients: {},

    reset: () => { model.clients = {} },
    addAppointment: (client, data) => {
        (model.clients[client]) ?
            model.clients[client].push({ status: 'pending', date: data.date })
            : model.clients[client] = [{ status: 'pending', date: data.date }]
    },
    attend: (client, data) => {
        model.clients[client].map((c) => { if (c.date === data) { c.status = 'attended' } })
    },
    expire: (client, data) => {
        model.clients[client].map((c) => { if (c.date === data) { c.status = 'expired' } })
    },
    cancel: (client, data) => {
        model.clients[client].map((c) => { if (c.date === data) { c.status = 'cancelled' } })
    },
    erase: (client, data) => {
        model.clients[client] = model.clients[client]?.filter(c => !(c.date === data || c.status === data));
    },
    getAppointments: (client, data) => {
        if (!data) { return model.clients[client] }
        return model.clients[client].filter(c => (c.status === data))
    },
    getClients: () => {
        return Object.keys(model.clients)
    }
}


// -------- Metodos del server --------


server.use(bodyParser.json());
server.listen(3000);

server.get('/api', (req, res) => {                     // Okey
    res.status(200).send(model.clients)
})

server.post('/api/Appointments', (req, res) => {       // Bad Request
    if (typeof req.body.client === 'string') {
        model.addAppointment(req.body.client, req.body.appointment);
        res.status(200).send(model.clients[req.body.client].filter(c => (c.date === req.body.appointment.date))[0])
    }
    if (typeof req.body.client === 'number') {
        res.status(400).send('client must be a string')
    }
    res.status(400).send('the body must have a client property')
})

server.get('/api/Appointments/clients', (req, res)=>{
    res.status(200).send(model.getClients())
})

server.get('/api/Appointments/:name', (req, res) => {

    const { name } = req.params;
    const { date, option } = req.query;

    if (!model.clients[name]) { res.status(400).send('the client does not exist') };

    if (model.clients[name]) {
        if (model.clients[name].every(c => c.date !== date)) {
            res.status(400).send('the client does not have a appointment for that date')
        }
        var result = model.clients[name].filter(c => c.date);
        if (option === 'cancel' || option === 'attend' || option === 'expire') {
            if (option === 'cancel') {
                model.cancel(name, date);
                res.status(200).send(model.clients[name][0])
            }
            else {
                (option === 'expire' ? model.expire(name, date) : model.attend(name, date));
                res.status(200).send(result)
            }
        }
        else { res.status(400).send('the option must be attend, expire or cancel') }
    };
})

server.get('/api/Appointments/:name/erase', (req, res) => {
    const { name } = req.params;
    const { date } = req.query;

    if (!model.clients[name]) { res.status(400).send('the client does not exist') };

    let erased = model.clients[name]?.filter(c => c.data === date || c.status === date);
    model.erase(name, date);
    res.status(200).send(erased)
})

server.get('/api/Appointments/getAppointments/:name', (req, res) => {
    const { name } = req.params;
    const { status } = req.query;
    if (model.clients[name]) {
        res.status(200).send(model.getAppointments(name, status))
    }
})


module.exports = { model, server };

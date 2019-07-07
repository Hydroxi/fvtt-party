const MODULE_NAME = '-> PARTY';

class Party extends Application {

    constructor() {
        super();

        this.members = [];
        this.min = [];
        this.max = [];

        Hooks.on('renderActorDirectory', (app, html, data) => {
            if (game.user.isGM) {
                let button = $('<button id="party-tracker"><i class="fas fa-file-alt"></i> Party Tracker</button>');
                button.on('click', (e) => {
                    this.log("requesting render");
                    this.log(this.members);
                    this.render(true);
                });
                html.prepend(button);
            }
        });

        Hooks.on('ready', () => {
            this.log('Hook "ready" called');
            this.init();

            this.log(this.members);
        });

        Hooks.on('createActor', (actor) => {
            // skip NPCs 
            // else update the info
            this.log('Hook "createActor" called');
            this.log(actor);
            this.update();
        });

        Hooks.on('updateActor', (actor) => {
            // skip NPCs 

            this.log('Hook "updateActor" called');
            this.log(actor);
            this.update(actor);
        });

        Hooks.on('updateToken', (token) => {
            this.log('Hook "updateToken" called');
            this.log(token);
            
            let val = undefined;
            if (token.data.bar1.attribute !== undefined && token.data.bar1.attribute === 'attributes.hp') {
                val = token.data.bar1;
            } 
            if (token.data.bar1.attribute !== undefined && token.data.bar1.attribute === 'attributes.hp') {
                val = token.data.bar1;
            }

            let idx = this.findById(token.data.actorId);
            if (idx !== undefined && val !== undefined) {
                this.log('Updating ' + idx + ' with ' );
                this.log(val);
                Object.assign(this.members[idx].hp, val);
            }

            this.log(this.getData());
        });
    }

    // send a formatted log message to console.log
    log = (obj) => {
        if (typeof obj === 'string') {
            console.log(MODULE_NAME + ' | ' + obj);
        } else {
            console.log(MODULE_NAME + ':');
            console.log(obj);
        }
    };

    init() {
        this.log('initializing');
        game.actors.entities.forEach(actor => {
            this.log(actor);
            if (actor.isPC === false) return;
            
            let info = this.collectInformation(actor);
            
            // default visibility
            info.show = true;
            this.members.push(info);
        });
        this.sort();
    }

    update(actor) {
        if (actor.isPC === false) {
            // perhaps it was an PC once?
            let idx = this.findById(actor.data._id);
            if (idx !== undefined) {
                this.members.splice(idx, 1);
            } 
            // ignore NPCs
            this.log(this.members);
            return;
        }
        let info = this.collectInformation(actor);
        let idx = this.findById(info.id);
        if (idx !== undefined) {
            Object.assign(this.members[idx], info);
        } else {
            info.show = true;
            this.members.push(info);
        }
        this.sort();
    }

    toggleVisibility(id) {
        let idx = this.findById(id);
        if (idx !== undefined) {
            this.members[idx].show = !this.members[idx];
        }
    }

    findById(id) {
        for (let i = 0; i < this.members.length; i++) {
            if (this.members[i].id === id) {
                return i;
            }
        } 
        return undefined;
    }

    sort() {
        this.members = this.members.sort((a, b) => {
            return a.name < b.name;
        });

        this.log(this.members);
    }

    collectInformation(actor) {
        let info = {
            id: actor.data._id,
            name: actor.data.name.split(' ').shift(),
            hp: {
                value: parseInt(actor.data.data.attributes.hp.value),
                max: parseInt(actor.data.data.attributes.hp.max)
            },
            ac: parseInt(actor.data.data.attributes.ac.value),
            spellDC: parseInt(actor.data.data.attributes.spelldc.value),
            passivePerception:      10 + parseInt(actor.data.data.skills.prc.mod),
            passiveInvestigation:   10 + parseInt(actor.data.data.skills.inv.mod),
            passiveInsight:         10 + parseInt(actor.data.data.skills.ins.mod),
         }
        return info;
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = 'Party Overview';
        options.template= "public/modules/party/templates/app.html";
        options.width = 500;
        options.height = "auto";
        return options;
    }

    getData() {
        return { data: this.members };
    }
}

let app = new Party();





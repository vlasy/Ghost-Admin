import ModalComponent from 'ghost-admin/components/modal-base';
import {alias} from '@ember/object/computed';
import {capitalize} from '@ember/string';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';

export default ModalComponent.extend({
    ajax: service(),
    store: service(),
    ghostPaths: service(),
    errorMessage: null,
    // Allowed actions
    confirm: () => {},
    apiKey: alias('model.apiKey'),
    user: alias('model.user'),
    actions: {
        confirm() {
            this.regeneratePersonalApiKey.perform();
        }
    },
    regeneratePersonalKey: task(function* () {
        let url = this.get('ghostPaths.url').api('/users/', this.user.id, 'api_key', this.apiKey.id, 'refresh');
        try {
            const response = yield this.ajax.post(url, {
                data: {
                    users: [{id: this.user.id}]
                }
            });
            this.store.pushPayload(response);
            yield this.confirm();
            this.send('closeModal');
        } catch (e) {
            let errMessage = `There was an error regenerating the ${capitalize(this.apiKey.type)} API Key. Please try again`;
            this.set('errorMessage', errMessage);
            return;
        }
    }).drop()
});

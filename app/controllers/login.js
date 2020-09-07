/* eslint-disable ghost/ember/alias-model-in-controller */
import Controller from '@ember/controller';
import ValidationEngine from 'ghost-admin/mixins/validation-engine';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency';

export default Controller.extend(ValidationEngine, {
    notifications: service(),
    session: service(),

    token: '',
    flowErrors: '',

    actions: {
        submit() {
            return this.resetPassword.perform();
        }
    },

    resetPassword: task(function () {
        this.set('flowErrors', '');

        try {
            try {
                this.session.authenticate('authenticator:token', this.token);
                return true;
            } catch (error) {
                this.notifications.showAPIError(error, {key: 'password.reset'});
            }
        } catch (error) {
            if (error && this.get('errors.length') === 0) {
                throw error;
            }
        }
    }).drop()
});

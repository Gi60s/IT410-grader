'use strict';
const Account       = require('../bin/account');
const expect        = require('chai').expect;

describe('account', () => {

    it('can create account', async () => {
        const account = new Account('bob');
        await account.create('bob@gmail.com', 'pass', 'Bob', 'Smith');
    });

    it('can delete account', async () => {
        let exists = await Account.exists('bob');
        expect(exists).to.be.true;

        const account = new Account('bob');
        await account.login('pass');
        await account.remove();

        exists = await Account.exists('bob');
        expect(exists).to.be.false;
    });

    it('can get account', async () => {
        const account = new Account('bob');
        await account.create('bob@gmail.com', 'pass', 'Bob', 'Smith');

        const account2 = new Account('bob');
        await account2.login('pass');

        expect(account2.email).to.equal(account.email);

        await account.remove();
    });

    it('can update own account', async () => {
        const account = new Account('bob');
        await account.create('bob@gmail.com', 'pass', 'Bob', 'Smith');

        account.email ='bob2@gmail.com';
        await account.update({ lastName: 'Jones' });

        expect(account.email).to.equal('bob2@gmail.com');
        expect(account.lastName).to.equal('Jones');

        await account.remove();
    });

});
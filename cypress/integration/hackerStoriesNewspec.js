describe('Hacker Stories', () => {
  const newTerm = 'Cypress';

  context('Hitting the real API', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          pathname: '**/search',
          query: {
            query: 'redux',
            page: '0',
            hitsPerPage: '100',
          },
        },
        { fixture: 'empty' },
      ).as('empty');

      cy.intercept(
        {
          method: 'GET',
          pathname: '**/search',
          query: {
            query: newTerm,
            page: '0',
            hitsPerPage: '100',
          },
        },
        { fixture: 'stories' },
      ).as('stories');

      cy.visit('https://hackernews-seven.vercel.app/');
      cy.wait('@empty');
    });

    it('correctly caches the results', () => {
      const faker = require('faker');
      const randomWord = faker.random.word();
      let count = 0;

      cy.intercept(
        {
          method: 'GET',
          pathname: '**/search',
          query: {
            query: randomWord,
            page: '0',
            hitsPerPage: '100',
          },
        },
        (req) => {
          count++;
          req.reply({ fixture: 'empty' });
        },
      ).as('random');

      cy.search(randomWord).then(() => {
        expect(count, `newtwork calls to fetch ${randomWord}`).to.eq(1);

        cy.wait('@random');
        cy.search(newTerm);
        cy.wait('@stories');

        cy.search(randomWord).then(() => {
          expect(count, `newtwork calls to fetch ${randomWord}`).to.eq(1);
        });
      });
    });
  });
});

describe('Student self-service report', () => {
  it('shows only the student report and blocks teacher/admin areas', () => {
    cy.visit('/login');

    cy.get('input[formcontrolname="email"]')
      .clear()
      .type('student@school.local');
    cy.get('input[formcontrolname="password"]').clear().type('Password123!');
    cy.contains('button', 'Sign In').click();

    cy.url().should('include', '/student');
    cy.contains('My academic report');
    cy.contains('student@school.local');
    cy.contains('86/100');
    cy.contains('present');

    cy.visit('/teacher');
    cy.url().should('include', '/login');

    cy.get('input[formcontrolname="email"]')
      .clear()
      .type('student@school.local');
    cy.get('input[formcontrolname="password"]').clear().type('Password123!');
    cy.contains('button', 'Sign In').click();

    cy.visit('/admin');
    cy.url().should('include', '/login');
  });
});

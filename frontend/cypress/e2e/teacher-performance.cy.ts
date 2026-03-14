describe('Teacher performance workflow', () => {
  it('signs in as teacher and records marks and attendance in assigned scope', () => {
    const attendanceDate = `2026-05-${String(Cypress._.random(10, 28)).padStart(2, '0')}`;

    cy.visit('/login');

    cy.get('input[formcontrolname="email"]')
      .clear()
      .type('teacher@school.local');
    cy.get('input[formcontrolname="password"]').clear().type('Password123!');
    cy.contains('button', 'Sign In').click();

    cy.url().should('include', '/teacher');
    cy.contains('Teacher performance center');
    cy.contains('Teacher-scoped roster');
    cy.contains('a', 'Performance').click();

    cy.url().should('include', '/teacher/performance');
    cy.contains('Record or update marks and attendance');

    cy.get('input[formcontrolname="assessmentType"]')
      .clear()
      .type('Project Demo');
    cy.get('input[formcontrolname="score"]').clear().type('92');
    cy.get('input[formcontrolname="maxScore"]').clear().type('100');
    cy.get('input[formcontrolname="term"]').clear().type('Term 2');
    cy.contains('button', 'Add mark').click();

    cy.contains('Mark created.');
    cy.contains('92/100');

    cy.get('input[formcontrolname="date"]').clear().type(attendanceDate);
    cy.get('input[formcontrolname="notes"]')
      .clear()
      .type('Teacher Cypress attendance');
    cy.contains('button', 'Add attendance').click();

    cy.contains('Attendance created.');
    cy.contains(attendanceDate);

    cy.contains('button', 'Edit').first().click();
    cy.contains('button', 'Save mark').should('exist');
  });
});

describe('Admin management workflow', () => {
  it('signs in as admin and visits each management screen', () => {
    cy.visit('/login');

    cy.get('input[formcontrolname="email"]').clear().type('admin@school.local');
    cy.get('input[formcontrolname="password"]').clear().type('Password123!');
    cy.contains('button', 'Sign In').click();

    cy.url().should('include', '/admin');
    cy.contains('Academic Control Room');

    cy.contains('a', 'Teachers').click();
    cy.contains('Create teacher');

    cy.contains('a', 'Students').click();
    cy.contains('Create student');

    cy.contains('a', 'Subjects').click();
    cy.contains('Create subject');

    cy.contains('a', 'Grades').click();
    cy.contains('Create grade');

    cy.contains('a', 'Enrollments').click();
    cy.contains('Create or archive student placements');

    cy.contains('a', 'Assignments').click();
    cy.contains('Bind teachers to class and subject contexts');

    cy.contains('a', 'Attendance').click();
    cy.contains('Record attendance events');
  });
});

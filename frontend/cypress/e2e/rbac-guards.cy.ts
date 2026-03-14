
type RoleCredentials = {
  email: string;
  password: string;
  homePath: string;
};

const accounts: Record<'admin' | 'teacher' | 'student', RoleCredentials> = {
  admin: {
    email: 'admin@school.local',
    password: 'Password123!',
    homePath: '/admin',
  },
  teacher: {
    email: 'teacher@school.local',
    password: 'Password123!',
    homePath: '/teacher',
  },
  student: {
    email: 'student@school.local',
    password: 'Password123!',
    homePath: '/student',
  },
};

function signInAs(account: RoleCredentials) {
  cy.visit('/login');
  cy.get('input[formcontrolname="email"]').clear().type(account.email);
  cy.get('input[formcontrolname="password"]').clear().type(account.password);
  cy.contains('button', 'Sign In').click();
  cy.url().should('include', account.homePath);
}

describe('RBAC guard coverage', () => {
  it('keeps admin out of teacher and student areas', () => {
    signInAs(accounts.admin);

    cy.visit('/teacher');
    cy.url().should('include', '/login');

    signInAs(accounts.admin);

    cy.visit('/student');
    cy.url().should('include', '/login');
  });

  it('keeps teacher out of admin and student areas', () => {
    signInAs(accounts.teacher);

    cy.visit('/admin');
    cy.url().should('include', '/login');

    signInAs(accounts.teacher);

    cy.visit('/student');
    cy.url().should('include', '/login');
  });

  it('keeps student out of admin and teacher areas', () => {
    signInAs(accounts.student);

    cy.visit('/admin');
    cy.url().should('include', '/login');

    signInAs(accounts.student);

    cy.visit('/teacher');
    cy.url().should('include', '/login');
  });
});

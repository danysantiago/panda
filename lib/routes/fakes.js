var Fakes = {};

Fakes.getCourses = [
    {
      'id': 'ICOM4009', 'name': 'Software Engineering',
      'assignments': [
        {
          'name': 'Assignment number one',
          'dueDate': 'October 23, 2014'
        },
        {
          'name': 'Assignment number two',
          'dueDate': 'October 25, 2015'
        }
      ]
    },
    {'id': 'ICOM4015', 'name': 'Advanced Programming'},
    {'id': 'ICOM4029', 'name': 'Compiler Construction'},
    {'id': 'ICOM4035', 'name': 'Data Structures'},
    {'id': 'ICOM5995', 'name': 'Design and Analysis of Algorithms (Pedrito Style)'},
    {'id': 'ICOM5995', 'name': 'Mi clase nueva pata.'}
];

Fakes.getUserCourses = [
  {
    'id': 'ICOM4009', 'name': 'Software Engineering',
    'assignments': [
      {
        'name': 'Assignment number one',
        'dueDate': 'October 23, 2014'
      },
      {
        'name': 'Assignment number two',
        'dueDate': 'October 25, 2015'
      }
    ]
  },
  {'id': 'ICOM4015', 'name': 'Advanced Programming'},
  {'id': 'ICOM4029', 'name': 'Compiler Construction'},
  {'id': 'ICOM4035', 'name': 'Data Structures'},
  {'id': 'ICOM5995', 'name': 'Design and Analysis of Algorithms (Pedrito Style)'},
  {'id': 'ICOM5995', 'name': 'Mi clase nueva pata.'}
];

module.exports = Fakes;
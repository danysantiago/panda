/**
 * This file contains the filters used throught panda.
 */

/**
 * Filter an array by multiple attributes.
 */
pandaApp.filter('filterByAttributes', function() {
  return function(array, query, attributes) {
    if (!array || !query) {
      return array;
    }

    // Returns an array filtered by the params. Params is an array of object
    // attributes that we wish to filter.
    return array.filter(function(element) {
      for (var i = 0; i < attributes.length; i++) {
        if (element[attributes[i]].toLowerCase().indexOf(
            query.toLowerCase()) > -1) {
          return true;
        };
      }
      return false;
    });
  };
});

/**
 * Filter for removing already enrolled courses in student/courses
 */
pandaApp.filter('removeEnrolledCourses', function() {
  return function(courses, enrolledCourses) {
    if (!courses || !enrolledCourses) {
      return courses;
    }

    return courses.filter(function(course) {
      for (var i = 0; i < enrolledCourses.length; i++) {
        if (enrolledCourses[i]._id === course._id) {
          // The course is already enrolled, do not add it to filtered array.
          return false;
        }
      }
      return true;
    });
  };
});

/**
 * Filter for standard date. Filtered data contains only the date.
 */
pandaApp.filter('filterDate', function() {
  return function(d) {
    var date = new Date(d);
    return date.toLocaleDateString();
  };
});

/**
 * Filter for standard date. Filtered data contains only the time.
 */
pandaApp.filter('filterTime', function() {
  return function(d) {
    var date = new Date(d);
    return date.toLocaleTimeString();
  };
});

/**
 * Filter for standard date. The filtered data contains both date and time.
 */
pandaApp.filter('filterDateTime', function() {
  return function(d) {
    var date = new Date(d);
    return date.toLocaleString();
  };
});

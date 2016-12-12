module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // check all js files for errors
    jshint: {
      all: ['public/src/js/**/*.js', 'public/src/js/*.js']
    },


    // minify all js files into app.min.js
    uglify: {
      options: {
        mangle: false
      },
      build: {
        files: {
          'public/dist/js/app.min.js': ['public/src/js/**/*.js']
        }
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    // respond to changes to scripts and stylesheets
    watch: {
      scripts: {
        files: ['public/src/js/*.js', 'public/src/js/**/*.js'],
        tasks: ['uglify']
      },
      livereload: {
        files: ['public/*/*', 'public/views/*.html'],
        options: {
          livereload: true
        }
      }
    },

    // run watch and nodemon tasks concurrently
    concurrent: {
      dev: {
        options: {
          logConcurrentOutput: true,
        },
        tasks: ['watch', 'nodemon:dev']
      }
    }

  });

  // load tasks
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');

  // register tasks on run grunt
  grunt.registerTask('default', [
    // 'jshint:all',
    // 'uglify',
    'concurrent'
  ]);

};

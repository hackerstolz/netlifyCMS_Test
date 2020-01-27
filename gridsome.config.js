// This is where project configuration and plugin options are located. 
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
    siteName: 'Gridsome',

    templates: {
       Hackathon: '/:title'
    },

    transformers: {
      remark: {
        externalLinksTarget: '_blank',
        externalLinksRel: ['nofollow', 'noopener', 'noreferrer'],
        anchorClassName: 'icon icon-link',
        plugins: [
          '@gridsome/remark-prismjs'
        ]
      }
    },
    plugins: [
      {
        use: '@gridsome/source-filesystem',
        options: {
          path: 'content/hackathons/**/*.md',
          typeName: 'Hackathon',
          refs: {
                    // Creates a GraphQL collection from challenges in front-matter and adds a reference.
                    /*
                    challenges: {
                      typeName: 'Challenge'//,
                      //create: true
                    } */
                  },
          remark: {
            plugins: [
              // ...local plugins
            ]
          }
        }
      },
      {
          use: '@gridsome/source-filesystem',
          options: {
            path: 'content/challenges/**/*.md',
            typeName: 'Challenge',
            refs: {
                    hackathon: { typeName: 'Hackathon' },
					price: { typeName: 'Price' },
					badge: { typeName: 'Badge' },
					category: { typeName: 'Category' }
                    },
            remark: {
              plugins: [
                // ...local plugins
              ]
            }
          }
      },
	  {
          use: '@gridsome/source-filesystem',
          options: {
            path: 'content/badges/**/*.md',
            typeName: 'Badge',
            refs: {
                    },
            remark: {
              plugins: [
                // ...local plugins
              ]
            }
          }
      },
	  {
          use: '@gridsome/source-filesystem',
          options: {
            path: 'content/categories/**/*.md',
            typeName: 'Category',
            refs: {
					price: 	{
							 typeName: 'Price'//,
							 //create: true
							}
                    },
            remark: {
              plugins: [
                // ...local plugins
              ]
            }
          }
      },
	  {
          use: '@gridsome/source-filesystem',
          options: {
            path: 'content/prices/**/*.md',
            typeName: 'Price',
            refs: {
                    },
            remark: {
              plugins: [
                // ...local plugins
              ]
            }
          }
      },
	  {
          use: '@gridsome/source-filesystem',
          options: {
            path: 'content/parties/**/*.md',
            typeName: 'Party',
            refs: {
					role: 	{ typeName: 'Role' },
					hackathon: { typeName: 'Hackathon' }
                    },
            remark: {
              plugins: [
                // ...local plugins
              ]
            }
          }
      },
	  {
          use: '@gridsome/source-filesystem',
          options: {
            path: 'content/roles/**/*.md',
            typeName: 'Role',
            refs: {
                    },
            remark: {
              plugins: [
                // ...local plugins
              ]
            }
          }
      },
      {
          use: 'gridsome-plugin-netlify-cms',
          options: {
            publicPath: '/admin',
            modulePath: 'src/admin/index.js',
            configPath: 'src/admin/config.yml',
            htmlPath: 'src/admin/index.html',
            htmlTitle: 'My Gridsome integrated CMS',
            //plugins: ['@ncwidgets/id']
          }
      }/*,
      {
          use: 'gridsome-plugin-netlify-cms-paths'
      }*/
    ]

/*    plugins: [
        {
          use: '@gridsome/source-strapi',
          options: {
            apiURL: 'http://localhost:1337',
            queryLimit: 1000, // Defaults to 100
            contentTypes: ['Hackathon'],
            // Possibility to login with a Strapi user,
            // when content types are not publicly available (optional).
            // loginData: {
            //   identifier: '',
            //   password: ''
            //}
          }
        }
      ]
 */

}

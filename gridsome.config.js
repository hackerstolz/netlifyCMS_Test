// This is where project configuration and plugin options are located. 
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
    siteName: 'Gridsome',

    /*
	templates: {
       Hackathon: '/:title'
    },

    transformers: {
      remark: {
        externalLinksTarget: '_blank',
        externalLinksRel: ['nofollow', 'noopener', 'noreferrer'],
        anchorClassName: 'icon icon-link',
        plugins: [
         // '@gridsome/remark-prismjs'
        ]
      }
    },*/
    plugins: [
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

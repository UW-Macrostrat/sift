import React from 'react';
import Router from 'react-router';
import App from './components/App';

import Main from './components/Main';
import Unit from './components/Unit';
import Column from './components/Column';
import StratName from './components/StratName';
import Attributes from './components/Attributes';
import Definitions from './components/Definitions';
import Explore from './components/Explore';

import NoData from './components/NoData';

var { Route, DefaultRoute, RouteHandler, NotFoundRoute, Link } = Router;

var SiftRouter = Router.create({
   scrollBehavior: Router.ScrollToTopBehavior,
   routes:  (
     <Route handler={App}>
       <DefaultRoute path='' handler={Main}/>
       <Route name='unit' path='unit/:id' handler={Attributes}/>
       <Route name='column' path='column/:id' handler={Column} addHandlerKey={true}/>
       <Route name='group' path='group/:id' handler={Attributes} addHandlerKey={true}/>
       <Route name='interval' path='interval/:id' handler={Attributes}/>

       <Route name='strat_name_concept' path='strat_name_concept/:id' handler={StratName}/>
       <Route name='strat_name' path='strat_name/:id' handler={StratName}/>

       <Route name='lithology' path='lithology/:id' handler={Attributes}/>
       <Route name='lithology_type' path='lithology_type/:id' handler={Attributes}/>
       <Route name='lithology_class' path='lithology_class/:id' handler={Attributes}/>

       <Route name='environment' path='environment/:id' handler={Attributes}/>
       <Route name='environment_type' path='environment_type/:id' handler={Attributes}/>
       <Route name='environment_class' path='environment_class/:id' handler={Attributes}/>

       <Route name='economic' path='economic/:id' handler={Attributes}/>
       <Route name='economic_type' path='economic_type/:id' handler={Attributes}/>
       <Route name='economic_class' path='economic_class/:id' handler={Attributes}/>

       <Route name='definitions' path='definitions/:type' handler={Definitions}/>

       <Route name='explore_bare' path='explore' handler={Explore}/>
       <Route name='explore' path='explore/:x?' handler={Explore}/>

       <NotFoundRoute handler={NoData} />
     </Route>
   )
});

SiftRouter.run(function (Handler) {
  React.render(<Handler/>, document.getElementsByClassName('react')[0]);

  ga('send', 'pageview', document.location.href);
});

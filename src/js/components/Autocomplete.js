import React from 'react';
import AutocompleteResultItem from './AutocompleteResultItem';
import xhr from 'xhr';
import Config from './Config';

class Autocomplete extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
      results: this.resetResults(),
      selectedIndex: 0,
      selectedItem: {},
      tResults: 0,
      showSuggestions: false
    }

    this.cache = {}

    this.updateResults = this.updateResults.bind(this);
    this.fetch = this.fetch.bind(this);
    this.fulfillRequest = this.fulfillRequest.bind(this);
    this.update = this.update.bind(this);
    this.navigateResults = this.navigateResults.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.doit = this.doit.bind(this);
    this.showSuggestions = this.showSuggestions.bind(this);

  }

  resetResults() {
    return {
      strat_names: [],
      cols: [],
      intervals: [],
      liths: []
    }
  }

  updateResults(data) {
    data.burwell = [{"id": 0, "name": this.state.searchTerm}]
    // Set the data
    this.setState({results: data});

    // Record the total number of search results returned
    this.setState({tResults: Object.keys(data).map(category => {
      return data[category];
    }).map(d => {
      return d.length;
    }).reduce((a, b) => {
      return a + b;
    }, 0)});
  }

  fetch(query) {
    xhr({
      uri: `${Config.apiURL}/defs/autocomplete?query=${query}&exclude=lithology_attributes`
    }, (error, response, body) => {
      var response = JSON.parse(body);

      var keys = Object.keys(response.success.data);

      // Trim each category of results to our limit
      for (var i = 0; i < keys.length; i++) {
        response.success.data[keys[i]] = response.success.data[keys[i]].slice(0, (this.props.limit + 1));
      }

      // Cache the results so we don't have to make an HTTP request
      // next time we see the same query
      this.cache[query] = response.success.data;

      // Update the current result list
      this.updateResults(response.success.data);
    });
  }

  fulfillRequest(query) {
    // Check if the query is long enough to fulfill
    if (query.length >= this.props.minLength) {
      // If it's cached, use the suggestions from there
      if (this.cache[query]) {
        this.updateResults(this.cache[query]);
      // Otherwise request them from the API
      } else {
        this.fetch(query);
      }
    } else {
      this.updateResults(this.resetResults());
    }
  }

  update(event) {
    this.setState({searchTerm: event.target.value});
    this.fulfillRequest(event.target.value);
    this.setState({selectedIndex: 0});

    if (event.target.value !== this.state.selectedItem.title) {
      this.setState({showSuggestions: true});
    }
  }

  navigateResults(event) {
    switch(event.which) {
      // Down arrow
      case 40:
        if ((this.state.selectedIndex + 1) <= this.state.tResults) {
          this.setSelected(this.state.selectedIndex += 1);
        }
        break;
      // Up arrow
      case 38:
        if (this.state.selectedIndex > 0) {
          this.setSelected(this.state.selectedIndex -= 1);
        }
        break;
      // ->
      case 39:
        this.setSelected(1);
        break;
      // Enter
      case 13:
        if (this.state.tResults === 1) {
          this.setSelected(1);
        }
        this.doit();
        break;
      // Tab
      case 9:
        if (this.state.tResults) {
          this.setSelected(1);
        }
        break;
      default:
        break;
    }

    if ([9, 13, 38, 39, 40].indexOf(event.which) > -1) {
      event.preventDefault();
    }
  }

  setSelected(idx) {
    this.setState({selectedIndex: idx});
  }

  doit() {
    var target;
    var item;
    if (this.state.selectedIndex === 0) {
      target = 1;
    } else {
      target = this.state.selectedIndex
    }
    if (this.refs[target]) {
      item = this.refs[target];
    } else {
      item = {props: {
        id: this.state.searchTerm,
        title: this.state.searchTerm,
        dataset: 'burwell'
      }}
    }
    this.setState({selectedItem: item.props});
    this.setState({searchTerm: item.props.title});
    if (this.props.categoryRoutes[item.props.dataset] != 'burwell') {
      window.location.hash = "#/" + this.props.categoryRoutes[item.props.dataset] + "/" + item.props.id;
    } else {
      window.location.hash = "#/burwell/" + item.props.title.toLowerCase();
    }

    this.setState({
     showSuggestions: false,
     searchTerm: '',
     results: this.resetResults()
    });

    document.getElementsByClassName('autocomplete-input')[0].blur();
  }

  showSuggestions() {
    this.setState({showSuggestions: true});
  }

  render() {
    // This is used to ensure that each suggestion has a unique ref/id
    var resultCounter = 1;
    var keys = Object.keys(this.state.results);

    for (var key = 0; key < keys.length; key++) {
      var itemList = [];

      this.state.results[keys[key]].forEach(d => {
        itemList.push(<AutocompleteResultItem
                        title={d.name}
                        id={d.id}
                        dataset={keys[key]}
                        index={resultCounter}
                        key={resultCounter}
                        ref={resultCounter}
                        selected={this.state.selectedIndex}
                        notify={this.setSelected}
                        select={this.doit}
                      />);
        resultCounter += 1;
      });

      // Save this list as a property of the dataset
      this.state.results[keys[key]].toRender = itemList;
    }

    return (
      <div className='autocomplete-container'>
        <input
          className='autocomplete-input'
          type='text'
          autoComplete='off'
          spellCheck='false'
          placeholder='Search...'
          value={this.state.searchTerm}
          onKeyDown={this.navigateResults}
          onChange={this.update}
          onFocus={this.showSuggestions}
        />

      <div className={(this.state.showSuggestions && this.state.searchTerm.length > 1 && this.state.tResults > 0) ? 'autocomplete-results' : 'hidden'}>
          {Object.keys(this.state.results).map((type, idx) => {
            return (
              <div className={this.state.results[type].length ? 'autocomplete-result-category' : 'hidden' } key={idx}>
                <p className='autocomplete-result-category-title'>{this.props.categoryLookup[type]}</p>
                <ul className='autocomplete-result-category-list'>
                  {this.state.results[type].toRender}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

Autocomplete.defaultProps = {
  limit: 5,
  minLength: 2,
  categoryLookup: {
    'columns': 'Columns',
    'intervals': 'Intervals',
    'strat_name_concepts': 'Stragrigraphic Names',
    'strat_name_orphans': 'Other names',
    'lithologies': 'Lithologies',
    'environments': 'Environments',
    'econs': 'Economic',
    'burwell': 'Burwell',
    'groups': 'Groups'
  },
  categoryRoutes: {
    'columns': 'column',
    'intervals': 'interval',
    'strat_name_concepts': 'strat_name_concept',
    'lithologies': 'lithology',
    'environments': 'environment',
    'burwell': 'burwell',
    'groups': 'group',
    'econs': 'economic'
  }
}

export default Autocomplete;
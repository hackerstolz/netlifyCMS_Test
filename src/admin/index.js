import CMS from "netlify-cms"
//import { UuidControl, UuidPreview } from 'netlify-cms-widget-uuid'

//CMS.registerWidget('uuid', UuidControl, UuidPreview)

import uuid from 'uuid/v4';

/**
 * Create the control widget, this will add a form element to the cms UI
 */
const IdControl = window.createClass({  
    getInitialState: function() {    return {};  },
    componentDidMount: function() {
        // If this widget doesn't have an ID yet we create one using the UUID package    
        if (!this.props.value) { 
            this.props.onChange(uuid());    
        } 
    }, 
    handleChange() { 
        this.props.onChange(uuid());
    },  
    render: function() { 
        return window.h('p', null, `${this.props.value}`);
    },

	componentDidUpdate: function() {
		const regString = " (regenerated) ";
        // If this widget doesn't have an ID yet we create one using the UUID package  
		if(this.props.value.includes(regString)){ //it was just regenerated - update it silently (without update -> else endless loop)
		//if (this.props.uniqueFieldId == "NEW"){
			//this.props.uniqueFieldId = "undefined";
			this.props.value = this.props.value.replace(regString, "");
		}else{ //seems to be copy case -> regenerated 
			//this.props.regen = "X";
			//this.props.uniqueFieldId = uuid();
			//this.props.uniqueFieldId = "NEW";
			this.props.onChange(uuid() + regString);
			
		}
    }/*,
	getSnapshotBeforeUpdate: function(){
		if(prevProps.value == this.props.value){ //no change -> lets trigger change of value
			this.props.uniqueFieldId = uuid();
		}		
	}*/
});

/**
 * Create the preview widget, this will display the widgets value in the NetlifyCMS preview pane
 */
const IdPreview = window.createClass({  
    getInitialState: function() { console.log(this.props); return {}; }, 
    render: function() { 
        return window.h('p', null, `ID: ${this.props.value}`);  
    }
});

// Register the widget. This lets NetlifyCMS know about our custom widget
CMS.registerWidget('uuid', IdControl, IdPreview);
const fs = require('fs');
const yaml = require('yaml');

const NC_COLLECTION = 'collections';
const NC_FIELDS = 'fields';
const NC_LIST = 'list';
const NC_RELATION = 'relation';
const NC_DEFAULT_FORMAT = 'frontmatter'; //if format not specified 

const PRINT_LOG = true;

exports.parse = function(cmsConfigFilePath){
		var parser = new Parser(cmsConfigFilePath);
		return parser.parseCollections();
};

exports.load = function(cmsConfigFilePath, contentRootPath, api){
    //Preparation: parse config.yml of NetlifyCMS to get collection's schema information and init loader
    var parser = new Parser(cmsConfigFilePath);
	var loader = new ContentLoader(parser.parseCollections(), contentRootPath, api);
	loader.load();
};


class SchemaCollection{
	constructor(name, label, folder, format, idFieldName){
		this.name = name;
		this.label = label;
		this.folder = folder;
		this.format = ( format === undefined ) ? NC_DEFAULT_FORMAT : format;
		this.idFieldName = idFieldName;
		this.fields = new Map();
		this.gsCollection = undefined;		//Will be added during load
	}
	
	addField(fieldName, fieldNode){
		this.fields.set(fieldName, fieldNode);
	}
	
	getIdField(){
		return this.fields.get(this.idFieldName);
	}
	
}

class SchemaNode{
	
	constructor(name, label, widget, parent){
		this.name = name;
		this.label = label;
		this.widget = widget;		
		this.parent = parent; //for calculating full path?
		this.fields = new Map();
		this.relation = {
			collection: '',
			idFieldName: ''
		};
		this.gsObject = undefined;
		this.gsCollection = undefined;		//Will be added during load
	}
	
	isRelation(){
		return this.widget == NC_RELATION;
	}
	
	isArray(){
		return this.widget == NC_LIST;
	}
	
	addField(fieldName, fieldNode){
		this.fields.set(fieldName, fieldNode);
	}	
}

class Parser{
	
	constructor(cmsConfigFilePath){		
		var cmsConfigFile = cmsConfigFilePath; //'./config.yml';
		this.collections = new Map();
		var file = fs.readFileSync(cmsConfigFile, 'utf8');
		this.doc = yaml.parseDocument(file);
		
		this.log("Loaded " + cmsConfigFile);
	}	
	
	parseCollections(){
		let i = 0;
		while(this.doc.contents.hasIn([NC_COLLECTION,i])){
			//collections = doc.contents.get('collections');
			let configNode = this.doc.contents.getIn([NC_COLLECTION,i]);
			let name = configNode.get('name');
			this.log('Parsing ' + name);
			let schemaCollection = new SchemaCollection(
									name,
									configNode.get('label'),
									configNode.get('folder'),
									configNode.get('format'),
									configNode.get('identifier_field')
									);
			this.collections.set(name, schemaCollection);
			//increase depth
			this.parseFields(configNode, schemaCollection);
			i++;
		}
		return this.collections;
	}

	parseFields(configNode, schemaNode){
		let i = 0;
		while(configNode.hasIn([NC_FIELDS,i])){
			let configNodeField = configNode.getIn([NC_FIELDS,i]);
			let name = configNodeField.get('name');
			let schemaField = new SchemaNode(
											name,
											configNodeField.get('label'),
											configNodeField.get('widget'),
											schemaNode
											);
			schemaNode.addField(name, schemaField);
			//Add information if relation
			if(schemaField.isRelation()){
				schemaField.relation.collection = configNodeField.get('collection');
				schemaField.relation.idFieldName = configNodeField.get('valueField');
			}
			
			//recursion - increase depth if a list
			if (schemaField.isArray()){
				this.log("Parsing List: " + name + " in " + schemaNode.name);
				this.parseFields(configNodeField, schemaField);
			}		
			i++;
		}
	}
	
	log(text){
		if (PRINT_LOG) console.log(text);
	}
}


class ContentLoader{
	constructor(schemaCollections,	//the fulle Map of SchemaCollection
				contentRootPath,    // Path of folder where the defined path per collection starts
				api                 //The Gridsome API for building GraphQL
				){
		this.schemaCollections = schemaCollections;
		this.contentRootPath = contentRootPath;  // './json/'
		this.api = api;
		this.log("Content load initialized");
	}
	
	load(){
		for (const collection of this.schemaCollections.values()) {
			if(collection.format == 'json'){
				this.log("Loading Collection " + collection.name);
				this.loadCollection(collection);			
			}else{
				this.log("Format of Collection " + collection.name + " not supported - currently only JSON is supported!");
			}					
		}
	}
	
	loadCollection(collection){
	    //Add Collection to gridsome and store references in schema (internal arrays are handled by gridsome)
	    collection.gsCollection = this.api.addCollection(collection.name);

		//Get files in folder - TODO: filter by defined extension
		let dirPath = this.contentRootPath + collection.folder;		
		var files = fs.readdirSync(dirPath, {withFileTypes:true});
		if (files === undefined){
			this.log("No content files found in " + dirPath);
		}else{
			for (const file of files){
				if(file.isFile() && file.name.includes('.json')){ //only parse JSON and avoid subfolders
					this.loadJSONFile(collection, dirPath + "/" + file.name);
				}else{
					this.log("Skipped " + file.name);
				}
			}
		}
	}

	loadJSONFile(collection, path){		
		let file = fs.readFileSync(path, 'utf8');
		let content = JSON.parse(file);
		if(content[collection.idFieldName] === undefined){
		    return this.log("ID field '" + collection.idFieldName + "' missing in " + path);
		}
		var gsNode = { id: content[collection.idFieldName]};
		//loop over fields via schema definition - not defined attributes will be ignored
		for (let schemaNode of collection.fields.values()){
			if(content[schemaNode.name] !== undefined && schemaNode.name != collection.idFieldName){
				this.log(schemaNode.name + ": " + content[schemaNode.name]);
				gsNode[schemaNode.name] = this.processJSONEntry(schemaNode, content[schemaNode.name]);
			}			
		}
		//all fields collected for Node -> add to Collection
        collection.gsCollection.addNode(gsNode);
	}
	
	processJSONEntry(schemaNode, value){
		if (schemaNode.isArray()){
		    //this is a list within a node  add ech content line in array in format of subsctructure
             var gsArray = [];
			//value is an array -> process list entries recursive
			for (let contentListEntry of value){
                let gsArrayEntry = {};
				for(let schemaSubNode of schemaNode.fields.values()){
					if(contentListEntry[schemaSubNode.name] !== undefined){
						//Recursion - process filled fields in list entry
						gsArrayEntry[schemaSubNode.name] = this.processJSONEntry(schemaSubNode, contentListEntry[schemaSubNode.name]);
					}
				}
                gsArray.push(gsArrayEntry);
			}
			//return reference to subnode of subcollection
			return gsArray //this.api.store.createReference(....);
		}else if (schemaNode.isRelation()){
			//process reference to other object
			//this.log(value + " in " + schemaNode.parent.name + "." + schemaNode.name + " references to " + schemaNode.relation.collection + "." + schemaNode.relation.idFieldName);
			return this.api.store.createReference(schemaNode.relation.collection, value);
		}else{
			//standard field with a value
			//this.log(value + " in " + schemaNode.parent.name + "." + schemaNode.name);
			return value;
		}
	}
	
	log(text){
		if (PRINT_LOG) console.log(text);
	}	
}






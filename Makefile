all: clientmocha clientchai

clientmocha: public/javascripts/mocha.js public/stylesheets/mocha.css

public/javascripts/mocha.js:
	cp node_modules/mocha/mocha.js $@

public/stylesheets/mocha.css:
	cp node_modules/mocha/mocha.css $@

clientchai: public/javascripts/chai.js

public/javascripts/chai.js:
	cp node_modules/chai/chai.js $@


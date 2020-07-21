module.exports.SebediusError = class extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'SebediusError';
	}
};

module.exports.NotFoundError = class extends ReferenceError {
	constructor(msg) {
		super(msg);
		this.name = 'NotFound';
	}
};

module.exports.CatalogNotFoundError = class extends module.exports.NotFoundError {
	constructor(msg) {
		super(msg);
		this.name = 'CatalogNotFound';
	}
};

module.exports.NoSelectionElementsError = class extends TypeError {
	constructor(msg) {
		super(msg);
		this.name = 'NoSelectionElements';
	}
};

module.exports.SelectionCancelledError = class extends Error {
	constructor(msg) {
		super(msg);
		this.name = 'SelectionCancelled';
	}
};
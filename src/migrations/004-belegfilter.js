exports.up = async DB => {
	DB.prepare(
		`
		ALTER TABLE medienbezeichnung ADD COLUMN beleg_filter INTEGER
  `
  ).run();
};

exports.down = async client => {
	// just in case...
};

function Path(d) {
	if (!(this instanceof Path)) {
		return new Path(d);
	}

	if (Array.isArray(d)) {
		this.points = d;
	} else {
		const points = d.trim()
			.split(/\s*(?=[A-Z])/i)
			.map((pointString) => {
				return pointString.trim()
				// These two replaces are to simplify the split regex
					.replace(/([^, ])-/g, '$1,-')
					.replace(/([a-z])(?![,])/gi, '$1 ')
					.split(/[\s,]+/)
					.map((coord, i) => (i === 0 ? coord : Number(coord)));
			})
			.map((pointArray, i, allPoints) => {
				// This is done in a separate map so that lastPoint is parsed point
				const command = pointArray[0];

				if (i === 0 || command.toUpperCase() === command) {
					return pointArray;
				}

				const prev = allPoints[i - 1];

				pointArray[0] = pointArray[0].toUpperCase();

				pointArray.slice(1).forEach((num, i) => {
					pointArray[i + 1] += prev[prev.length - (i % 2 === 0 ? 2 : 1)];
				});

				return pointArray;
			});

		this.points = points;

		this._originalPath = d;
	}
}

module.exports = Path;

Path.prototype.d = function getPathString(options) {
	options = Object.assign({
		type: 'relative',
	}, options);

	return this.points
		.map((point, i, allPoints) => {
			if (i === 0 || options.type === 'absolute') {
				return point[0] + point.slice(1).map((num) => toImpreciseString(num)).join(',');
			}

			const prev = allPoints[i - 1];

			return point[0].toLowerCase() + point.slice(1).map((num, i) => {
					return toImpreciseString(num - prev[prev.length - (i % 2 === 0 ? 2 : 1)]);
				}).join(',');
		})
		.join('');
};

function toImpreciseString(num) {
	return num.toFixed(1).replace('.0', '');
}

Path.prototype.toString = Path.prototype.d;

Path.scale = function initPathScale(pathStrings, options) {
	options = Object.assign({
		loop: false, // start from 0 when loop gets above 1?
	}, options);

	const paths = pathStrings.map((str) => str instanceof Path ? str : new Path(str));

	// Check that what we're trying to do is actually possible
	paths.slice(1).forEach((path) => {
		if (path.points.length !== paths[0].points.length) {
			throw new Error('Both paths have to be the same length, sorry');
		}

		path.points.forEach(([command], i) => {
			if (command !== paths[0].points[i][0]) {
				throw new Error('Command types have to match, sorry');
			}
		});
	});

	if (options.loop) {
		paths.push(paths[0]);
	}

	const sectionSize = 1 / (paths.length - 1);

	return function pathScale(x) {
		// Calculate which two paths to mix, and how much to actually mix them by
		const index = Math.floor(x / sectionSize);
		const realX = (x % sectionSize) / sectionSize;

		// If x lands on a path, just return the path
		if (realX < Number.EPSILON || index + 1 === paths.length) {
			return paths[index];
		}

		const a = paths[index];
		const b = paths[index + 1];

		// Mix the two lines by mixing the individual points together
		const newPoints = a.points.map((aPoint, i) => {
			const bPoint = b.points[i];

			const newPoints = aPoint.slice(1)
				.map((num, i) => num * (1 - realX) + bPoint[i + 1] * realX);

			return [aPoint[0], ...newPoints];
		});

		return new Path(newPoints);
	};
};
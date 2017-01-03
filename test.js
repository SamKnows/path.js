import test from 'ava';
import Path from './src/path';

test('Path constructor', (t) => {
	const path0 = new Path('M 100 200 L 300 400');
	t.is(path0.d(), 'M100,200l200,200');

	const path1 = new Path(' M -20 20.5l 10,400');
	t.is(path1.d(), 'M-20,20.5l10,400');

	const path2 = new Path('M7,-1l1-.5');
	t.is(path2.toString(), 'M7,-1l1,-0.5');

	t.pass();
});

test('path function', (t) => {
	const path0 = Path('M 100 200 L 300 400');
	t.is(path0.d(), 'M100,200l200,200');

	t.pass();
});

test('simple scales', (t) => {
	const pathScale0 = Path.scale(['M 100 100 L 200 200', 'M 200 100 L 100 200']);

	t.is(typeof pathScale0, 'function');
	t.is(pathScale0(0).toString(), 'M100,100l100,100');
	t.is(pathScale0(0.25).toString(), 'M125,100l50,100');
	t.is(pathScale0(0.5).toString(), 'M150,100l0,100');
	t.is(pathScale0(0.75).toString(), 'M175,100l-50,100');
	t.is(pathScale0(1).toString(), 'M200,100l-100,100');
	t.is(pathScale0(1.5).toString(), 'M200,100l-100,100');

	t.pass();
});

test('complex scales', (t) => {
	const pathScale0 = Path.scale([
		'M90.7,181.3c0,0,48.4-23.7,72.1,19',
		'M100.7,181.3c0,0,24.2,32.3-19,47.3',
		'M100.7,181.3c0,0,17,30-40,38.3',
		'M100.7,181.3c0,0-6.9,39.7-47.5,18.6'
	]);

	t.is(typeof pathScale0, 'function');
	t.is(pathScale0(0).toString(), 'M90.7,181.3c0,0,48.4,-23.7,72.1,19');
	t.is(pathScale0(0.5).toString(), 'M100.7,181.3c0,0,20.6,31.2,-29.5,42.8');
	t.is(pathScale0(0.75).toString(), 'M100.7,181.3c0,0,11,32.4,-41.9,33.4');
	t.is(pathScale0(1).toString(), 'M100.7,181.3c0,0,-6.9,39.7,-47.5,18.6');

	t.pass();
});

test('scale looping', (t) => {
	const pathScale0 = Path.scale([
		'M90.7,181.3c0,0,48.4-23.7,72.1,19',
		'M100.7,181.3c0,0,24.2,32.3-19,47.3',
		'M100.7,181.3c0,0,17,30-40,38.3',
		'M100.7,181.3c0,0-6.9,39.7-47.5,18.6'
	], { loop: true });

	t.is(typeof pathScale0, 'function');
	t.is(pathScale0(0).toString(), 'M90.7,181.3c0,0,48.4,-23.7,72.1,19');
	t.is(pathScale0(0.25).toString(), 'M100.7,181.3c0,0,24.2,32.3,-19,47.3');
	t.is(pathScale0(0.5).toString(), 'M100.7,181.3c0,0,17,30,-40,38.3');
	t.is(pathScale0(0.75).toString(), 'M100.7,181.3c0,0,-6.9,39.7,-47.5,18.6');
	t.is(pathScale0(1).toString(), 'M90.7,181.3c0,0,48.4,-23.7,72.1,19');

	t.pass();
});
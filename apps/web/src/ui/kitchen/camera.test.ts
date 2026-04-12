import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import CameraWidget from './CameraWidget.svelte';

describe('CameraWidget', () => {
	it('renders without crashing', () => {
		render(CameraWidget);
	});

	it('displays camera widget container', () => {
		render(CameraWidget);
		expect(screen.getByRole('region')).toBeTruthy();
	});
});

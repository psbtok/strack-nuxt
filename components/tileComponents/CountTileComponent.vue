<template>
	<div class="count-tile" :style="blockStyle">
		<span class="value">{{ count }}</span>
		<span class="regular">{{ recordLabel }}</span>
	</div>
</template>

<script>
import { useMainStore } from '@/stores/main';
import { computed } from 'vue';

export default {
	props: {
		fontColor: {
			type: String,
			default: 'inherit',
		},
	},
	setup(props) {
		const store = useMainStore();
		const WIDTH_PER_CHAR = 30;
		const MIN_WIDTH = 30;
		const count = computed(() => store.selectedStats.count);
		const recordLabel = computed(() => (count.value === 1 ? 'record' : 'records'));
		const blockStyle = computed(() => {
			const valueText = `${String(count.value ?? '-')} ${recordLabel.value}`;
			return {
				color: props.fontColor || 'inherit',
				fontWeight: 700,
				fontSize: '1.25em',
				width: `${Math.max(valueText.length * WIDTH_PER_CHAR, MIN_WIDTH)}px`,
			};
		});

		return {
			count,
			recordLabel,
			blockStyle,
		};
	},
};
</script>

<style scoped>
.count-tile {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	text-align: center;
	transition: width .3s ease;
}

.value {
	display: inline-block;
	text-align: center;
	font-weight: 700;
}

.regular {
	display: inline-block;
	text-align: center;
	font-weight: 400;
}
</style>


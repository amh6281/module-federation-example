// @ts-nocheck
// This is a template file with placeholders. Replace {{Domain}}, {{domain}}, {{domainId}} before using.

import { queryOptions } from '@tanstack/react-query';
import { get{{Domain}}s, get{{Domain}} } from '@/modules/api/reserve/{{domain}}';

// ============================================================================
// Query Factory
// ============================================================================

export const {{domain}}Queries = {
	all: () => ['{{domain}}s'],
	{{domain}}s: () =>
		queryOptions({
			queryKey: [...{{domain}}Queries.all()],
			queryFn: get{{Domain}}s,
		}),
	{{domain}}: ({{domainId}}: number) =>
		queryOptions({
			queryKey: ['{{domain}}', {{domainId}}],
			queryFn: () => get{{Domain}}({{domainId}}),
			enabled: !!{{domainId}},
		}),
};

// ============================================================================
// Mutations Template (for mutations.ts file)
// ============================================================================

// Copy the following code to mutations.ts file:

import { ModalType } from '@/constants';
import { create{{Domain}}, update{{Domain}}, delete{{Domain}} } from '@/modules/api/reserve/{{domain}}';
import type { {{Domain}} } from '@/modules/types/{{Domain}}';
import { getErrorMessage } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '../../client/modal';
import { {{domain}}Queries } from './queries';

export const useCreate{{Domain}} = () => {
	const navigate = useNavigate();
	const openModal = useModalStore(state => state.actions.openModal);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({{domain}}: Partial<{{Domain}}>) => create{{Domain}}({{domain}}),
		onSuccess: data => {
			// Navigate if needed
			// navigate(Paths.{{DOMAIN}}S_MANAGE);
			
			queryClient.setQueryData({{domain}}Queries.{{domain}}s().queryKey, prev => {
				if (!prev) return prev;
				return {
					...prev,
					value: [...prev.value, data],
					total: prev.total + 1,
				};
			});
		},
		onError: error => {
			openModal({
				type: ModalType.ALERT,
				message: getErrorMessage(error.response?.data?.error),
			});
		},
	});
};

export const useUpdate{{Domain}} = () => {
	const navigate = useNavigate();
	const openModal = useModalStore(state => state.actions.openModal);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({{domain}}: Partial<{{Domain}}>) => update{{Domain}}({{domain}}),
		onSuccess: data => {
			// Navigate if needed
			// navigate(Paths.{{DOMAIN}}S_MANAGE);
			
			queryClient.setQueryData({{domain}}Queries.{{domain}}s().queryKey, prev => {
				if (!prev) return prev;
				return {
					...prev,
					value: prev.value.map(item =>
						item.{{domainId}} === data.{{domainId}} ? data : item,
					),
				};
			});
			queryClient.setQueryData({{domain}}Queries.{{domain}}(data.{{domainId}}).queryKey, data);
		},
		onError: error => {
			openModal({
				type: ModalType.ALERT,
				message: getErrorMessage(error.response?.data?.error),
			});
		},
	});
};

export const useDelete{{Domain}} = () => {
	const openModal = useModalStore(state => state.actions.openModal);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({{domainId}}: number) => delete{{Domain}}({{domainId}}),
		onSuccess: (_, {{domainId}}) => {
			queryClient.setQueryData({{domain}}Queries.{{domain}}s().queryKey, prev => {
				if (!prev) return prev;
				return {
					...prev,
					value: prev.value.filter(item => item.{{domainId}} !== {{domainId}}),
					total: prev.total - 1,
				};
			});
		},
		onError: error => {
			openModal({
				type: ModalType.ALERT,
				message: getErrorMessage(error.response?.data?.error),
			});
		},
	});
};

// ============================================================================
// Selectors Template (for selectors.ts file)
// ============================================================================

// Copy the following code to selectors.ts file:

import type { {{Domain}} } from '@/modules/types/{{Domain}}';

export const select{{Domain}}ById = (state: PagedResponse<{{Domain}}>, id: number) =>
	state.value.find(item => item.{{domainId}} === id);

export const select{{Domain}}sByStatus = (state: PagedResponse<{{Domain}}>, status: string) =>
	state.value.filter(item => item.status === status);

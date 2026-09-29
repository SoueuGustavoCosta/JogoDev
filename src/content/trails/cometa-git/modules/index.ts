import type { Module } from '@/domain/trail/types';
import { modGitcInit } from './init';
import { modGitcCommit } from './commit';
import { modGitcBranches } from './branches';
import { modGitcMerge } from './merge';
import { modGitcGithub } from './github';

export const cometaGitModules: Module[] = [modGitcInit, modGitcCommit, modGitcBranches, modGitcMerge, modGitcGithub];

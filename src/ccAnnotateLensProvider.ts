'use strict';

import * as vscode from 'vscode';
import {ccAnnotateLens} from './ccAnnotateLens';
import {ClearCase} from './clearcase'

export class ccCodeLensProvider implements vscode.CodeLensProvider
{
	static selector = {
		scheme: "file"
	};

	public constructor(private m_context: vscode.ExtensionContext, private m_clearcase: ClearCase)
	{
	}

	async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]>
	{
		let l_lenses: vscode.CodeLens[] = [];
		let l_isCcO: boolean;
		try
		{
			l_isCcO = await this.m_clearcase.isClearcaseObject(document.uri);
		}
		catch(error)
		{
			l_isCcO = error;
		}
		if( document !== undefined && l_isCcO === true )
		{
			l_lenses.push(new ccAnnotateLens(document, new vscode.Range(0,0,0,1)));
		}
		return l_lenses;
	}

	public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): Thenable<vscode.CodeLens>
	{
		if( codeLens instanceof ccAnnotateLens )
			return this.ccAnnotationCommand(codeLens, token);

		return Promise.reject<vscode.CodeLens>(undefined);
	}

	private ccAnnotationCommand(iLens: ccAnnotateLens, iToken: vscode.CancellationToken)
	{
		iLens.command = {
			title: "Toggle annotations",
			command: "extension.ccAnnotate",
			arguments: [iLens.document.uri]
		};
		return Promise.resolve(iLens);
	}
}
import React, { useEffect } from 'react';
import type { MetaFunction } from '@remix-run/node';
import {
  useFetcher,
  useLoaderData,
  useMatch,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';

import { EditBlockForm } from '~/components/pages/pipelines/EditBlockForm';
import type {
  IBlockConfig,
  IConfigConnection,
  IInterfaceConfig,
  IInterfaceConfigFormOutputProperty,
  IInterfaceConfigProperty,
  INode,
  IPipeline,
} from '~/components/pages/pipelines/pipeline.types';
import { IInterfaceConfigFormProperty } from '~/components/pages/pipelines/pipeline.types';
import {
  getEdges,
  getNodes,
  prepareBlockConnections,
  toPipelineConfig,
} from '~/components/pages/pipelines/PipelineFlow.utils';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { metaWithDefaults } from '~/utils/metadata';
import { routes } from '~/utils/routes.utils';

import { BlockInputList } from './BlockInputList';
import type { loader } from './loader.server';

type IExtendedBlockConfig = IBlockConfig & { oldName: string };

export function EditBlockPage() {
  const { organizationId, pipelineId, block, pipeline } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const updateFetcher = useFetcher<IPipeline>();
  const [searchParams] = useSearchParams();
  const match = useMatch(
    '/:organizationId/pipelines/:pipelineId/build/blocks/:blockName',
  );
  const isSidebarOpen = !!match;

  const nodes = getNodes(pipeline.config);
  const edges = getEdges(pipeline.config);

  const closeSidebar = (value?: boolean) => {
    if (value) return;

    navigate(
      routes.pipelineBuild(
        organizationId,
        pipelineId,
        Object.fromEntries(searchParams.entries()),
      ),
    );
  };

  const closeWithReset = () => {
    navigate(
      routes.pipelineBuild(
        organizationId,
        pipelineId,
        Object.fromEntries(searchParams.entries()),
      ),
      { state: { reset: true } },
    );
  };

  const handleSubmit = (
    updatedBlock: IExtendedBlockConfig,
    connections: IConfigConnection[],
  ) => {
    const updatedNodes = nodes.map((node) => updateNode(node, updatedBlock));
    const updatedConnections = connections.map((connection) =>
      updateConnection(connection, updatedBlock),
    );
    const updatedInterfaces = validateInterfaceConfigs(
      pipeline.interface_config,
      updatedBlock,
    );

    updateFetcher.submit(
      {
        ...pipeline,
        interface_config: updatedInterfaces,
        config: {
          ...toPipelineConfig(updatedNodes, edges),
          connections: updatedConnections,
        },
      },
      {
        method: 'PUT',
        encType: 'application/json',
        action: routes.pipelineBuild(pipeline.organization_id, pipeline.id),
      },
    );
  };

  useEffect(() => {
    if (updateFetcher.data) {
      closeWithReset();
    }
  }, [updateFetcher.data]);

  return (
    <DialogDrawer open={isSidebarOpen} onOpenChange={closeSidebar}>
      <DialogDrawerContent className="md:max-w-[700px] md:w-[600px] lg:w-[700px]">
        <DialogDrawerHeader>
          <DialogDrawerTitle>{block.name}</DialogDrawerTitle>
          <DialogDrawerDescription>
            {block.block_type?.description}
          </DialogDrawerDescription>
        </DialogDrawerHeader>

        <DialogDrawerBody>
          <EditBlockForm
            onSubmit={handleSubmit}
            blockConfig={block}
            organizationId={pipeline.organization_id}
            pipelineId={pipeline.id}
            nodesNames={nodes.map((node) => node.data.name)}
            connections={pipeline.config.connections}
          >
            <BlockInputList
              connections={prepareBlockConnections(
                pipeline.config.connections,
                block,
              )}
            />
          </EditBlockForm>
        </DialogDrawerBody>
      </DialogDrawerContent>
    </DialogDrawer>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Block',
    },
  ];
});

function updateConnectionEnd<T>(
  end: { block_name: string } & T,
  updated: IExtendedBlockConfig,
) {
  return {
    ...end,
    block_name:
      end.block_name === updated.oldName ? updated.name : end.block_name,
  };
}

function updateConnection(
  connection: IConfigConnection,
  updated: IExtendedBlockConfig,
) {
  return {
    ...connection,
    from: updateConnectionEnd(connection.from, updated),
    to: updateConnectionEnd(connection.to, updated),
  };
}

function updateNode(node: INode, updated: IExtendedBlockConfig) {
  if (node.id === updated.oldName) {
    const { oldName: _, ...rest } = updated;
    node.data = rest;
    node.id = updated.name;
  }

  return node;
}

function validateInterfaceConfigs(
  interfaces: IInterfaceConfig,
  updated: IExtendedBlockConfig,
): IInterfaceConfig {
  const validate = validateInterfaceProperty(updated);

  return {
    ...interfaces,
    webchat: {
      ...interfaces.webchat,
      inputs: interfaces.webchat.inputs.map(validate),
      outputs: interfaces.webchat.outputs.map(validate),
    },
    form: {
      ...interfaces.form,
      inputs: interfaces.form.inputs.map(
        validate,
      ) as IInterfaceConfigFormProperty[],
      outputs: interfaces.form.outputs.map(
        validate,
      ) as IInterfaceConfigFormOutputProperty[],
    },
  };
}

function validateInterfaceProperty<T>(updated: IExtendedBlockConfig) {
  return (property: IInterfaceConfigProperty) => {
    const updatedProperty: IInterfaceConfigProperty = { ...property };

    if (property.name === updated.oldName) {
      updatedProperty.name = updated.name;
    }

    return updatedProperty;
  };
}

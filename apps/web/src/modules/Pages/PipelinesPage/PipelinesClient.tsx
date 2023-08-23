'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Icon, Indicator } from '@elpassion/taco';
import { Modal } from '@elpassion/taco/Modal';
import { TPipeline } from '~/contracts';
import { ROUTES } from '~/modules/Config';
import { CreatePipelineForm } from '~/modules/Pipelines';
import { useModal } from '~/utils/hooks';

interface PipelinesClientProps {
  pipelines: TPipeline[];
}

export const PipelinesClient = ({ pipelines }: PipelinesClientProps) => {
  const { isModalOpen, openModal, closeModal: closeModalBase } = useModal();

  function closeModal() {
    closeModalBase();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8 text-xs font-medium">
          <div className="flex items-center justify-center gap-2">
            <p>Usage</p>
            {/* TODO (hub33k): find sort icon */}
            <Icon
              iconName="bar-chart"
              size="sm"
              className="-rotate-90 transform-gpu text-neutral-500"
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <p>Monthly</p>
            <Icon
              iconName="chevron-down"
              size="sm"
              className="flex items-center justify-center"
            />
          </div>
        </div>

        <div>
          <Button text="New workflow" size="xs" onClick={openModal} />
        </div>
      </div>

      <div className="mb-6" />

      <div className="flex flex-col gap-2">
        {pipelines.map((pipeline) => {
          return (
            <div
              key={pipeline.id}
              className="bg-white px-6 py-4 transition-all hover:bg-neutral-100"
            >
              <Link href={ROUTES.PIPELINE(pipeline.id)}>
                <div className="">
                  <div className="flex items-center text-neutral-700">
                    <div className="flex flex-grow">
                      <p className="text-lg font-semibold">{pipeline.name}</p>
                    </div>
                    <div className="flex items-center gap-12">
                      <div>
                        <p className="text-sm">$2.45</p>
                      </div>
                      <div>
                        <p className="text-sm">113 runs</p>
                      </div>
                      <div>
                        <Indicator
                          variant="badge"
                          type="success"
                          text="Active"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3" />

                  <div className="flex gap-6">
                    <div className="flex gap-2">
                      <Icon iconName="zap" size="xs" />
                      <p className="text-xs">Zapier API</p>
                    </div>
                    <div className="flex gap-2">
                      <Icon iconName="arrow-right" size="xs" />
                      <p className="text-xs">Sequence</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        ariaHideApp={false}
        closeIcon="x"
      >
        <div className="w-[400px]">
          <CreatePipelineForm />
        </div>
      </Modal>
    </>
  );
};

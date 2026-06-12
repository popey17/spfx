import * as React from 'react';
import styles from './FollowThePath.module.scss';
import type { IFollowThePathProps } from './IFollowThePathProps';
import { escape } from '@microsoft/sp-lodash-subset';

interface IPathStep {
  title: string;
  detail: string;
}

const defaultSteps: IPathStep[] = [
  { title: 'Start', detail: 'Begin your journey and review the path ahead.' },
  { title: 'Learn', detail: 'Explore resources and understand each milestone.' },
  { title: 'Apply', detail: 'Put guidance into practice on your SharePoint site.' },
  { title: 'Complete', detail: 'Reach the end of the path and celebrate progress.' }
];

export default class FollowThePath extends React.Component<IFollowThePathProps, { activeStep: number }> {
  public constructor(props: IFollowThePathProps) {
    super(props);
    this.state = { activeStep: 0 };
  }

  private _goToStep = (index: number): void => {
    this.setState({ activeStep: index });
  };

  private _goPrevious = (): void => {
    this.setState((prev) => ({ activeStep: Math.max(0, prev.activeStep - 1) }));
  };

  private _goNext = (): void => {
    this.setState((prev) => ({ activeStep: Math.min(defaultSteps.length - 1, prev.activeStep + 1) }));
  };

  public render(): React.ReactElement<IFollowThePathProps> {
    const { description, userDisplayName } = this.props;
    const { activeStep } = this.state;
    const currentStep = defaultSteps[activeStep];

    return (
      <section className={styles.followThePath}>
        <header className={styles.header}>
          <h2 className={styles.title}>Follow the Path</h2>
          <p className={styles.subtitle}>
            Welcome, {escape(userDisplayName)}. {escape(description)}
          </p>
        </header>

        <ol className={styles.path} aria-label="Path steps">
          {defaultSteps.map((step, index) => {
            const status =
              index < activeStep ? styles.complete :
              index === activeStep ? styles.current :
              styles.upcoming;

            return (
              <li key={step.title} className={`${styles.step} ${status}`}>
                <button
                  type="button"
                  className={styles.stepButton}
                  onClick={() => this._goToStep(index)}
                  aria-current={index === activeStep ? 'step' : undefined}
                >
                  <span className={styles.stepMarker}>{index + 1}</span>
                  <span className={styles.stepLabel}>{step.title}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <article className={styles.panel}>
          <h3>{currentStep.title}</h3>
          <p>{currentStep.detail}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.navButton} onClick={this._goPrevious} disabled={activeStep === 0}>
              Previous
            </button>
            <button
              type="button"
              className={`${styles.navButton} ${styles.primary}`}
              onClick={this._goNext}
              disabled={activeStep === defaultSteps.length - 1}
            >
              Next
            </button>
          </div>
        </article>
      </section>
    );
  }
}
